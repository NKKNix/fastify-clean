// infrastructure/eventPublisher/kafkaPublisher.ts
import { Kafka, RecordMetadata} from 'kafkajs';
import { IEventPublisher } from '../../domain/repositories/kafkaRepository';

import { LogEntry } from '../../domain/entities/LogEntry';
import { trace } from '@opentelemetry/api';

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? 'default-client',
  brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
});

const producer = kafka.producer();

export class KafkaPublisher implements IEventPublisher {
  async publish(event: LogEntry, topic: string): Promise<void> {
    const span = trace.getTracer('service-1').startSpan('send_kafka_message');
    try {
      // const traceContext = span.spanContext().traceId;
      await producer.connect();

      await producer.send({
        topic: topic,
        messages: [
          {
            key: event.eventType,
            value: JSON.stringify(event),
          },
        ],
      });

      await producer.disconnect(); // หรือ keep alive ก็ได้
    }finally {
      span.end();  // สิ้นสุด span
    }
  }
  public async connect(): Promise<void> {
    try {
      await producer.connect();
      console.log('Kafka Producer connected successfully.');
    } catch (error) {
      console.error('Failed to connect Kafka Producer:', error);
      // หากเชื่อมต่อไม่ได้ ควรจะให้แอปฯ ปิดตัวลง หรือมีกลไก retry
      process.exit(1);
    }
  }

  // เมธอดสำหรับยกเลิกการเชื่อมต่อ (เรียกใช้ตอนแอปฯ ปิด)
  public async disconnect(): Promise<void> {
    try {
      await producer.disconnect();
      console.log('Kafka Producer disconnected successfully.');
    } catch (error) {
      console.error('Failed to disconnect Kafka Producer:', error);
    }
  }
  async publish2(event: LogEntry, topic: string): Promise<void> {
    const span = trace.getTracer('kafka-publisher').startSpan('publish_single_event');
    try {
      await producer.send({
        topic: topic,
        messages: [{
          key: event.eventType,
          value: JSON.stringify(event),
        }],
      });
      span.addEvent(`Sent event with key ${event.eventType} to topic ${topic}`);
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: 'Error publishing event' }); // 2 = ERROR
      throw error; // ส่งต่อ error ให้ caller จัดการ
    } finally {
      span.end();
    }
  }

  // --- ฟังก์ชันใหม่ตามที่คุณต้องการ ---
  // ฟังก์ชันสำหรับส่ง Event หลายๆ ตัวพร้อมกัน (Batch Processing)
  async publishBatch(events: LogEntry[], topic: string): Promise<RecordMetadata[]> {
    const span = trace.getTracer('kafka-publisher').startSpan('publish_batch_events');
    if (events.length === 0) {
        span.addEvent('No events to publish.');
        span.end();
        return [];
    }

    try {
      const messages = events.map(event => ({
        key: event.eventType,
        value: JSON.stringify(event),
      }));

      const records = await producer.send({
        topic: topic,
        messages: messages,
      });

      span.addEvent(`Sent ${events.length} events to topic ${topic}`);
      return records;

    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: 'Error publishing batch events' });
      throw error;
    } finally {
      span.end();
    }
  }
}
