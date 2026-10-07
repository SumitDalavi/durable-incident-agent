const express = require('express');
const promClient = require('prom-client');
const app = express();
const port = 5002;

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'inventory_' });

const memoryUsage = new promClient.Gauge({ name: 'inventory_memory_usage_mb', help: 'Memory usage' });
let currentMemory = 200;

app.get('/metrics', async (req, res) => {
  memoryUsage.set(currentMemory);
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.post('/fault/memory-leak', (req, res) => { currentMemory = 4000; res.send('Fault injected'); });
app.post('/fault/reset', (req, res) => { currentMemory = 200; res.send('Fault reset'); });

app.listen(port, () => console.log(Inventory service on port \));
