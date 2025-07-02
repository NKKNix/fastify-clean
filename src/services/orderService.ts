import { randomUUID } from "crypto";
import { LogEntry } from "../domain/entities/LogEntry";
import { CacheService } from "../domain/repositories/Cache";
import { LogRepository } from "../domain/repositories/LogRepository";
import { UserRepository } from "../domain/repositories/UserRepository";
import { KafkaPublisher } from "../infrastructure/provider/kafkaProducer";
import { Order } from "@prisma/client";
import { OrderRepository } from "../domain/repositories/OrderRepository";

export class OrderService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cacheService: CacheService,
    private readonly eventRepo: LogRepository,
    private readonly eventPublisher: KafkaPublisher,
    private readonly orderRepository: OrderRepository,
    
  ) {}
  async placeOrder(userId: string, product: Array<Order>): Promise<void> {

    const user = await this.userRepository.findByEmail(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const order = await this.orderRepository.create(user.id, product);
    // Create the event for order placement
    const event: LogEntry = {
      id: randomUUID(),
      timestamp: new Date(),
      eventType: 'OrderPlaced',
      payload: { userId: user.id, product: product,order: order},  // Payload contains relevant event data
      source: 'service1'  // Can be set dynamically based on the source of the event (e.g., service name)
    };
    await this.eventRepo.create(event);

    // Publish the event to Kafka
    await this.eventPublisher.publish(event,"order-service");
    return order
  }
  async getAllOrders(): Promise<Order[]> {
    return await this.orderRepository.getAll();
  }
}