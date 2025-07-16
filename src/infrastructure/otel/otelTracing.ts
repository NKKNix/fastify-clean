import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';


// 🔽 สร้าง Exporter ที่ใช้ HTTP และชี้ไปที่พอร์ต 4318
const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});
const metricExporter = new OTLPMetricExporter({
  url: 'http://localhost:4318/v1/metrics',
});
// 

const sdk = new NodeSDK({
  serviceName: 'userService',
  spanProcessor: new BatchSpanProcessor(traceExporter),
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 1000, // ลดเวลาลงเพื่อดีบักให้เห็นผลเร็ว
  }),
  instrumentations: [getNodeAutoInstrumentations({
    
  }
  )],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});