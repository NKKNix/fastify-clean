// src/app.ts
if (process.env.NODE_ENV !== 'test') {
  require('./infrastructure/otel/otelTracing');
}
import 'dotenv/config';
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AppDependencies, registerRoutes } from './gateways/route';
import { 
  httpRequestCounter, 
  httpServerDuration, 
  incrementActiveConnections, 
  decrementActiveConnections 
} from './infrastructure/otel/otelMetrics';
import { registerSwagger } from './infrastructure/services/swagger';
import { PrismaUserRepository } from './domain/repositories/UserRepository';
import { RedisCacheService } from './infrastructure/services/redis';
import { EventStoreLogRepository } from './domain/repositories/LogRepository';
import { KafkaPublisher } from './infrastructure/services/kafkaProducer';
import { PrismaOrderRepository } from './domain/repositories/OrderRepository';
import { OrderService } from './services/orderService';
import { EventStoreDBClient } from "@eventstore/db-client";
// ฟังก์ชันสำหรับสร้างแอป
export function build(deps: AppDependencies): FastifyInstance {
  const app = Fastify();
  if (process.env.NODE_ENV !== 'test') {
    registerSwagger(app);
  }

  // Hooks ทั้งหมดยังคงอยู่ที่นี่
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    incrementActiveConnections();
    (request as any).startTime = process.hrtime();
  });

  // --- Conditionally Add Hooks ---
  // Only add the OTel hooks when NOT in a test environment.
  if (process.env.NODE_ENV !== 'test') {
    app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
      incrementActiveConnections();
      (request as any).startTime = process.hrtime();
    });

    app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
      decrementActiveConnections();
      const attributes = {
        'http.method': request.method,
        'http.status_code': reply.statusCode,
      };
      httpRequestCounter.add(1, attributes);

      const startTime = (request as any).startTime as [number, number] | undefined;
      if (startTime) {
        const diff = process.hrtime(startTime);
        const durationSeconds = diff[0] + diff[1] / 1e9;
        httpServerDuration.record(durationSeconds, attributes);
      }
    });
  }
  app.register(async (instance) => {
    // Pass the instance from the plugin context to your function
    await registerRoutes(instance, deps);
  });

  return app;
}
export function buildRealApp(): FastifyInstance {
  // สร้าง Real Dependencies ทั้งหมดที่นี่
  const eventStoreClient = new EventStoreDBClient(
    { endpoint: "localhost:2113" }, // Replace with your actual EventStoreDB endpoint
    { insecure: true } // Set to false and provide credentials for production
  );
  const userRepository = new PrismaUserRepository();
  const cacheService = new RedisCacheService();
  const logRepository = new EventStoreLogRepository(eventStoreClient);
  const eventPublisher = new KafkaPublisher();
  const orderRepository = new PrismaOrderRepository();
  const orderService = new OrderService(userRepository, cacheService, logRepository, eventPublisher, orderRepository);

  const realDependencies: AppDependencies = {
    orderService,
    // ...services อื่นๆ
  };
  
  return build(realDependencies);
}