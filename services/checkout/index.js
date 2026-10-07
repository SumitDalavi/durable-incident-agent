const express = require('express');
const promClient = require('prom-client');
const app = express();
const port = 5001;

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'checkout_' });

const errorRate = new promClient.Gauge({ name: 'checkout_error_rate', help: 'Error rate of checkout service' });
const latency = new promClient.Gauge({ name: 'checkout_latency_ms', help: 'Latency of checkout service' });
let currentErrorRate = 0;
let currentLatency = 50;

app.get('/metrics', async (req, res) => {
  errorRate.set(currentErrorRate);
  latency.set(currentLatency);
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.post('/fault/spike-errors', (req, res) => { currentErrorRate = 0.8; res.send('Fault injected'); });
app.post('/fault/high-latency', (req, res) => { currentLatency = 5000; res.send('Fault injected'); });
app.post('/fault/reset', (req, res) => { currentErrorRate = 0; currentLatency = 50; res.send('Fault reset'); });

app.listen(port, () => console.log(Checkout service on port \));
