// infrastructure/eventPublisher/kafkaPublisher.ts
import { Kafka} from 'kafkajs';
import { IEventPublisher } from '../../domain/repositories/kafkaRepository';

import { LogEntry } from '../../domain/entities/LogEntry';

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? 'default-client',
  brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
});

const producer = kafka.producer();

export class KafkaPublisher implements IEventPublisher {


  async publish(event: LogEntry, topic: string): Promise<void> {
    await producer.connect(); // คุณอาจย้าย connect ไป init phase ก็ได้

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
  }
}
