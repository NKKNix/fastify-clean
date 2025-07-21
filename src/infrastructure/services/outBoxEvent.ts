import { KafkaPublisher } from "./kafkaProducer";
import { prisma } from "./prisma";
import { context, propagation, SpanStatusCode, trace } from '@opentelemetry/api';

const eventPublisher = new KafkaPublisher();
const tracer = trace.getTracer('outbox-publisher-tracer');
export const startOutboxWorker = () => {
  setInterval(async () => {
    const events = await prisma.outboxEvent.findMany({
      where: { processed: false },
      take: 10,
    });

    for (const event of events) {
      const hasTraceContext = typeof event.payload === 'object' && event.payload !== null && 'traceContext' in event.payload;
      const parentContext = hasTraceContext
        ? propagation.extract(context.active(), (event.payload as { traceContext: unknown }).traceContext)
        : context.active();

      await context.with(parentContext, async () => {
        await tracer.startActiveSpan('outbox-worker-publish', async (span) => {
          try {
            await eventPublisher.publish(
              {
            id: event.id,
            eventType: event.eventType,
            payload: event.payload,
            timestamp: event.createdAt,
            source: "orderService"
            },
              'order-service'
            );
            await prisma.outboxEvent.update({
              where: { id: event.id },
              data: { processed: true },
            });
            span.addEvent('Event published successfully.');
          } catch (err) {
            console.error('Failed to process event', event.id, err);
            span.recordException(err as Error);
            span.setStatus({ code: SpanStatusCode.ERROR });
          } finally {
            span.end();
          }
        });
      }); // End context.with
    }
  }, 5000);
};