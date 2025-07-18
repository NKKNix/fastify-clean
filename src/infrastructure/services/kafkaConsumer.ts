// inventory-service/kafka/consumer.ts
import '../tracing/otelTracing'
import { Kafka } from 'kafkajs';
import { InventoryService } from '../../services/inventoryService';
import { context, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';

const kafka = new Kafka({ brokers: ['localhost:9092'] });

const consumer = kafka.consumer({ groupId: 'inventory-group' });

export async function startConsumer(reserveInventoryService: InventoryService) {
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-service', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const span = trace.getTracer('kafka-consumer-tracer').startSpan('process_kafka_message', {
        kind: SpanKind.CONSUMER,
      });

      const event = JSON.parse(message.value!.toString());
      console.log('Received order:', event);
      try {
        await reserveInventoryService.reserveInventory(event);
        span.setStatus({ code: SpanStatusCode.OK });
      }catch(err){
        span.setStatus({ code: SpanStatusCode.ERROR });
        if (err instanceof Error) {
          console.error('Error processing Kafka message:', err.message);
        } else {
          console.error('Unknown error processing Kafka message:', err);
        }
      }finally {
        span.end();  // Make sure to end the span once done
      }
      
    }
    
  });
}
