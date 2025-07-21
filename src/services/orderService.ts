import { randomUUID } from "crypto";
import { LogEntry } from "../domain/entities/LogEntry";
import { CacheService } from "../domain/repositories/Cache";
import { LogRepository } from "../domain/repositories/LogRepository";
import { UserRepository } from "../domain/repositories/UserRepository";
import { KafkaPublisher } from "../infrastructure/services/kafkaProducer";
import { Order } from "@prisma/client";
import { OrderRepository } from "../domain/repositories/OrderRepository";
import { context, propagation } from "@opentelemetry/api";

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
    // Create the event for order placement
    const event: LogEntry = {
      id: randomUUID(),
      timestamp: new Date(),
      eventType: 'OrderPlaced',
      payload: { userId: user.id, product: product},  // Payload contains relevant event data
      source: 'service1'  // Can be set dynamically based on the source of the event (e.g., service name)
    };
    await this.eventRepo.create(event);
    await this.eventPublisher.publish(event,"order-service");
    const order = await this.orderRepository.create(user.id, product);
    return order
  }
  async getAllOrders(): Promise<Order[]> {
    const cached = await this.cacheService.get('orders');
    if (cached) {
      return JSON.parse(cached);
    }
    this.cacheService.set('orders', JSON.stringify(await this.orderRepository.getAll()));
    return await this.orderRepository.getAll();
  }
  async createOrderEvent(data: { userId: string; product: string }): Promise<void> {
    const traceContext = {};
    propagation.inject(context.active(), traceContext);

    const event: LogEntry = {
      id: randomUUID(),
      timestamp: new Date(),
      eventType: 'OrderPlaced',
      payload: {
        userId: data.userId,
        product: data.product,
        traceContext: traceContext, 
      },
      source: 'service1'
    };

    await this.eventRepo.create(event);
    await this.orderRepository.createOrderWithEvent(data, traceContext);
  }
}