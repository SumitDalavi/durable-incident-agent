const { initTelemetry } = require('./telemetry');
initTelemetry('payments');

require('../tracing.js');
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
collectDefaultMetrics({ register: client.register, prefix: 'payments_' });

const requestCounter = new client.Counter({
  name: 'payments_requests_total',
  help: 'Total requests to payments',
  labelNames: ['status']
});
const errorCounter = new client.Counter({
  name: 'payments_errors_total',
  help: 'Total errors in payments'
});
const activeConnections = new client.Gauge({
  name: 'payments_active_connections',
  help: 'Active connections'
});
const requestDuration = new client.Histogram({
  name: 'payments_request_duration_seconds',
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
  res.json({ status: 'healthy', service: 'payments' });
});

// Core logic
app.post('/api/action', async (req, res) => {
  requestCounter.labels('received').inc();
  if (state.spikeErrors && Math.random() < 0.8) {
    errorCounter.inc();
    return res.status(500).json({ error: 'Internal Server Error' });
  }

      if (state.cascade) {
      errorCounter.inc();
      return res.status(502).json({ error: 'Cascade fault' });
    }
    res.json({ status: 'success', service: 'payments' });
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

app.listen(5002, () => {
  logger.info('payments service running on port 5002');
});

