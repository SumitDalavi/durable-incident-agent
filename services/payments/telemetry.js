const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

function initTelemetry(serviceName) {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter: new OTLPTraceExporter({
      url: 'http://localhost:4318/v1/traces', // points to Tempo
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  
  sdk.start();
  console.log(`Telemetry initialized for ${serviceName}`);
  return sdk;
}

module.exports = { initTelemetry };
