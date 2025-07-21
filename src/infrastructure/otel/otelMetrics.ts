// src/metrics.ts

import { metrics } from '@opentelemetry/api';

// 1. สร้าง Meter ที่เป็นตัวกลาง
const meter = metrics.getMeter('fastify-app-meter');

// 2. สร้าง Metrics ทั้งหมดแล้ว export ออกไป

// Counter
export const httpRequestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

// Histogram
export const httpServerDuration = meter.createHistogram('http_server_duration', {
  description: 'Duration of HTTP server requests in seconds',
  unit: 's',
});

// Gauge
let activeConnections = 0;
const activeConnectionsGauge = meter.createObservableGauge('active_connections', {
  description: 'Number of active connections',
});
activeConnectionsGauge.addCallback(result => {
  result.observe(activeConnections);
});

// สร้างฟังก์ชันสำหรับจัดการ activeConnections เพื่อให้โค้ดสะอาดขึ้น
export const incrementActiveConnections = () => {
  activeConnections++;
};
export const decrementActiveConnections = () => {
  activeConnections--;
};