import { EventStoreDBClient } from "@eventstore/db-client";
import { EventStoreLogRepository } from "../domain/repositories/LogRepository";
import { PrismaUserRepository } from "../domain/repositories/UserRepository";
import { RedisCacheService } from "../infrastructure/services/redis";
import { KafkaPublisher } from "../infrastructure/provider/kafkaProducer";
import { OrderService } from "../services/orderService";
import { Order, Prisma } from "@prisma/client";
import { PrismaOrderRepository } from "../domain/repositories/OrderRepository";
import { FastifyReply, FastifyRequest } from "fastify";

const eventStoreClient = new EventStoreDBClient(
  { endpoint: "localhost:2113" }, // Replace with your actual EventStoreDB endpoint
  { insecure: true } // Set to false and provide credentials for production
);
const logRepository = new EventStoreLogRepository(eventStoreClient);
const userRepository = new PrismaUserRepository();
const orderRepository = new  PrismaOrderRepository();
const cacheService = new RedisCacheService();
const eventPublisher = new KafkaPublisher();
const orderService = new OrderService(userRepository,cacheService,logRepository,eventPublisher,orderRepository);


export const CreateOrder = async (request: FastifyRequest, reply: FastifyReply) => {
  const { name, order } = request.body as { name: string; order: Array<Order> };
  if (!order) {
    reply.code(400).send({ message: 'Order is required' });
    return;
  }
  if (!name) {
    reply.code(400).send({ message: 'Name is required' });
    return;
  }
  try {
    await orderService.placeOrder(name, order);
    reply.code(201).send({message: "Order placed successfully"});
  } catch (error) {
    reply.code(400).send({ message: (error as Error).message });
  }
};

export const GetAllOrders = async (request: FastifyRequest, reply: FastifyReply) => {
  const orders = await orderService.getAllOrders();
  reply.code(200).send(orders);
}