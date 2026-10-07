const { initTelemetry } = require('./telemetry');
initTelemetry('checkout');

const express = require('express');
const pino = require('pino');
const pinoHttp = require('pino-http');
const client = require('prom-client');
const axios = require('axios');
const cors = require('cors');

const logger = pino();
const app = express();
app.use(express.json());
app.use(cors());
app.use(pinoHttp({ logger }));

// Metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register, prefix: 'checkout_' });

const requestCounter = new client.Counter({
  name: 'checkout_requests_total',
  help: 'Total requests to checkout',
  labelNames: ['status']
});
const errorCounter = new client.Counter({
  name: 'checkout_errors_total',
  help: 'Total errors in checkout'
});
const activeConnections = new client.Gauge({
  name: 'checkout_active_connections',
  help: 'Active connections'
});
const requestDuration = new client.Histogram({
  name: 'checkout_request_duration_seconds',
  help: 'Duration of requests',
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Fault State
let state = {
  spikeErrors: false,
  highLatency: false,
  memoryLeak: false,
  dropConnections: false,
  cascade: false
};
let leakedMemory = [];

app.use((req, res, next) => {
  activeConnections.inc();
  const end = requestDuration.startTimer();
  res.on('finish', () => {
    activeConnections.dec();
    end();
  });

  if (state.dropConnections) {
    return res.socket.destroy();
  }
  
  if (state.memoryLeak) {
    leakedMemory.push(new Array(10000).fill('leak'));
  }

  if (state.highLatency) {
    setTimeout(next, 5000);
  } else {
    next();
  }
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'checkout' });
});

// Core logic
app.post('/api/checkout', async (req, res) => {
  requestCounter.labels('received').inc();
  if (state.spikeErrors && Math.random() < 0.8) {
    errorCounter.inc();
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  try {
    const payRes = await axios.post('http://localhost:5002/api/action', {}, { timeout: 2000 });
    const invRes = await axios.post('http://localhost:5003/api/action', {}, { timeout: 2000 });
    
    if (state.cascade) {
      throw new Error('Cascade fault simulated');
    }

    res.json({ status: 'success', payment: payRes.data, inventory: invRes.data });
  } catch (err) {
    errorCounter.inc();
    res.status(502).json({ error: 'Upstream dependency failed', details: err.message });
  }
});

// Fault Endpoints
app.post('/fault/:type', (req, res) => {
  const type = req.params.type;
  const validTypes = ['spike-errors', 'high-latency', 'memory-leak', 'drop-connections', 'cascade'];
  
  if (type === 'reset') {
    state = { spikeErrors: false, highLatency: false, memoryLeak: false, dropConnections: false, cascade: false };
    leakedMemory = [];
    logger.info("Faults reset");
    return res.json({ status: 'resetted' });
  }

  if (validTypes.includes(type)) {
    const key = type.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    state[key] = true;
    logger.warn(`Fault injected: ${type}`);
    return res.json({ status: 'injected', fault: type });
  }

  res.status(400).json({ error: 'Unknown fault' });
});

app.listen(5001, () => {
  logger.info('Checkout service running on port 5001');
});

