import { KafkaPublisher } from "./kafkaProducer";
import { prisma } from "./prisma";
import { context, propagation, SpanStatusCode, trace } from '@opentelemetry/api';

// --- Constants ---
const BATCH_SIZE = 10;
const POLLING_INTERVAL_MS = 5000;
const WORKER_ID = `worker-${process.pid}`; // ID เฉพาะสำหรับ Worker แต่ละตัว

// --- Dependencies ---
const eventPublisher = new KafkaPublisher();
const tracer = trace.getTracer('outbox-publisher-tracer');

/**
 * Worker หลักที่จะ Polling และ Publish event ไปยัง Kafka
 */
const processOutboxEvents = async () => {
  console.log(`[${WORKER_ID}] Polling for events...`);
  let claimedEvents: string | any[] = [];

  try {
    // Step 1 & 2: จองและดึง Events ใน Transaction เดียวกันเพื่อความปลอดภัย (Atomicity)
    await prisma.$transaction(async (tx: { outboxEvent: { findMany: (arg0: { where: { status: string; } | { id: { in: any; }; status: string; }; take?: number; select?: { id: boolean; }; }) => any[] | PromiseLike<any[]>; updateMany: (arg0: { where: { id: { in: any; }; status: string; }; data: { status: string; }; }) => any; }; }) => {
      // 1. ค้นหา ID ของ Events ที่พร้อมจะถูกประมวลผล (PENDING)
      const potentialEvents = await tx.outboxEvent.findMany({
        where: { status: 'PENDING' },
        take: BATCH_SIZE,
        select: { id: true }, // ดึงแค่ ID มาเพื่อความรวดเร็ว
      });

      if (potentialEvents.length === 0) {
        return; // ไม่มีงานให้ทำ ออกจาก Transaction
      }
      
      const eventIds = potentialEvents.map((e: { id: any; }) => e.id);

      // 2. "จอง" Events โดยเปลี่ยนสถานะเป็น PROCESSING
      // นี่คือหัวใจสำคัญที่ป้องกัน Race Condition
      await tx.outboxEvent.updateMany({
        where: {
          id: { in: eventIds },
          status: 'PENDING', // Double check เผื่อ node อื่นเอาไปแล้ว
        },
        data: {
          status: 'PROCESSING',
        },
      });

      // 3. ดึงข้อมูลเต็มๆ ของ Events ที่เราจองสำเร็จแล้ว
      claimedEvents = await tx.outboxEvent.findMany({
        where: {
          id: { in: eventIds },
          status: 'PROCESSING',
        },
      });
    });

    if (claimedEvents.length === 0) {
      console.log(`[${WORKER_ID}] No events claimed or available.`);
      return;
    }

    console.log(`[${WORKER_ID}] Claimed ${claimedEvents.length} events to process.`);

    // Step 4: ประมวลผลและ Publish Events ที่จองมา
    for (const event of claimedEvents) {
      // ดึง Trace Context จาก Payload เพื่อเชื่อม Trace ระหว่าง Services
      const hasTraceContext = typeof event.payload === 'object' && event.payload !== null && 'traceContext' in event.payload;
      const parentContext = hasTraceContext
        ? propagation.extract(context.active(), (event.payload as { traceContext: unknown }).traceContext)
        : context.active();

      // เริ่ม Span ใหม่ภายใต้ Parent Context ที่ดึงมา
      await context.with(parentContext, async () => {
        await tracer.startActiveSpan(`outbox-publish:${event.eventType}`, async (span) => {
          span.setAttribute('event.id', event.id);
          try {
            // Publish to Kafka
            await eventPublisher.publish(
              {
                id: event.id,
                eventType: event.eventType,
                payload: event.payload,
                timestamp: event.createdAt,
                source: "orderService"
              },
              'order-service' // Topic หรือ Key
            );

            // เมื่อสำเร็จ อัปเดตสถานะเป็น COMPLETED
            await prisma.outboxEvent.update({
              where: { id: event.id },
              data: { status: 'COMPLETED' },
            });
            
            span.addEvent('Event published successfully.');
            span.setStatus({ code: SpanStatusCode.OK });

          } catch (err) {
            console.error(`[${WORKER_ID}] Failed to process event ${event.id}`, err);
            
            // เมื่อล้มเหลว อัปเดตสถานะเป็น FAILED เพื่อจะได้ไม่พยายามซ้ำๆ
            // และสามารถมีกระบวนการอื่นมาจัดการกับ FAILED events ได้
            await prisma.outboxEvent.update({
              where: { id: event.id },
              data: { status: 'FAILED' },
            });

            span.recordException(err as Error);
            span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
          } finally {
            span.end();
          }
        });
      });
    }

  } catch (error) {
    console.error(`[${WORKER_ID}] A critical error occurred in the outbox worker:`, error);
  } finally {
    // ใช้ setTimeout เพื่อเรียกตัวเองใหม่หลังจากทำงานเสร็จสิ้น (หรือเกิดข้อผิดพลาด)
    // ซึ่งจะปลอดภัยกว่า setInterval ที่อาจทำงานซ้อนกันได้
    setTimeout(processOutboxEvents, POLLING_INTERVAL_MS);
  }
};


/**
 * ฟังก์ชันสำหรับเริ่มต้น Worker
 */
export const startOutboxWorker = () => {
  console.log("Outbox worker starting...");
  // เริ่มการทำงานครั้งแรก
  processOutboxEvents();
};