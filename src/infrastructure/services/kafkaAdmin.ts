// src/kafkaAdmin.ts
import { Kafka } from 'kafkajs';

const TOPIC_NAME = 'order-events';
const PARTITIONS = 4;

const kafka = new Kafka({
  clientId: 'my-admin',
  brokers: ['localhost:9092'],
});

const admin = kafka.admin();

const setup = async () => {
  try {
    console.log('Connecting admin client...');
    await admin.connect();
    console.log('Admin client connected.');

    const existingTopics = await admin.listTopics();
    if (existingTopics.includes(TOPIC_NAME)) {
      console.warn(`Topic "${TOPIC_NAME}" already exists.`);
      return;
    }

    console.log(`Creating topic "${TOPIC_NAME}" with ${PARTITIONS} partitions...`);
    await admin.createTopics({
      waitForLeaders: true,
      topics: [
        {
          topic: TOPIC_NAME,
          numPartitions: PARTITIONS,
          replicationFactor: 1,
        },
      ],
    });
    console.log('Topic created successfully.');
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    await admin.disconnect();
    console.log('Admin client disconnected.');
  }
};

setup();