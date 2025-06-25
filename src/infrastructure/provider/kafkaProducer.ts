// infrastructure/eventPublisher/kafkaPublisher.ts
import { Kafka } from 'kafkajs';
import { IEventPublisher } from '../../domain/repositories/kafkaRepository';
import { UserEvent } from '../../domain/entities/user.events';

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? 'default-client',
  brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
});

const producer = kafka.producer();

export class KafkaPublisher implements IEventPublisher {
  private readonly topic = process.env.KAFKA_TOPIC ?? 'user-events';

  async publish(event: UserEvent): Promise<void> {
    await producer.connect(); // คุณอาจย้าย connect ไป init phase ก็ได้

    await producer.send({
      topic: this.topic,
      messages: [
        {
          key: event.type,
          value: JSON.stringify(event),
        },
      ],
    });

    await producer.disconnect(); // หรือ keep alive ก็ได้
  }
}
