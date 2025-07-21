// src/server.ts
import { buildRealApp } from './app';
import { startOutboxWorker } from './infrastructure/services/outBoxEvent';

const app = buildRealApp();

app.listen({ port: Number(process.env.PORT) || 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
  startOutboxWorker(); // รัน worker หลังจาก server พร้อม
});