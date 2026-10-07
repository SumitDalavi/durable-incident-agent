const express = require('express');
const promClient = require('prom-client');
const app = express();
const port = 5003;

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'payments_' });

const connectionDrop = new promClient.Gauge({ name: 'payments_connection_drops', help: 'Dropped connections' });
let drops = 0;

app.get('/metrics', async (req, res) => {
  connectionDrop.set(drops);
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.post('/fault/drop-connections', (req, res) => { drops = 100; res.send('Fault injected'); });
app.post('/fault/reset', (req, res) => { drops = 0; res.send('Fault reset'); });

app.listen(port, () => console.log(Payments service on port \));
