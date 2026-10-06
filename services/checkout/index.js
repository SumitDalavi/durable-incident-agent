const express = require('express');
const promClient = require('prom-client');
const app = express();
const port = 5001;

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'checkout_' });

const errorRate = new promClient.Gauge({ name: 'checkout_error_rate', help: 'Error rate of checkout service' });
let currentErrorRate = 0;

app.get('/metrics', async (req, res) => {
  errorRate.set(currentErrorRate);
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.post('/fault/spike-errors', (req, res) => {
  currentErrorRate = 0.8; // 80% error rate
  res.send('Fault injected: checkout errors spiked');
});

app.post('/fault/reset', (req, res) => {
  currentErrorRate = 0;
  res.send('Fault reset');
});

app.listen(port, () => console.log(Checkout service on port \));
