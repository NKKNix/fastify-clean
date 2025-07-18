import 'dotenv/config';
import { PrismaInventRepository } from './domain/repositories/InventRepository';
import { InventoryService } from './services/inventoryService';
import { startConsumer } from './infrastructure/services/kafkaConsumer';

const inventoryRepository = new PrismaInventRepository();


const reserveInventoryService = new InventoryService(inventoryRepository);

// เริ่มต้น Kafka Consumer
startConsumer(reserveInventoryService).catch(console.error);