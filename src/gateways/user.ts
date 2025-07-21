import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../services/userService';
import { PrismaUserRepository } from '../domain/repositories/UserRepository';
import { RedisCacheService } from '../infrastructure/services/redis';

import { KafkaPublisher } from '../infrastructure/services/kafkaProducer';
import { EventStoreLogRepository } from '../domain/repositories/LogRepository';
import { EventStoreDBClient } from '@eventstore/db-client';

// Replace with your actual EventStoreDB connection string
const eventStoreClient = new EventStoreDBClient(
  { endpoint: "localhost:2113" }, // Replace with your actual EventStoreDB endpoint
  { insecure: true } // Set to false and provide credentials for production
);
const logRepository = new EventStoreLogRepository(eventStoreClient);
const userRepository = new PrismaUserRepository();
const cacheService = new RedisCacheService();
const eventPublisher = new KafkaPublisher();
const userService = new UserService(userRepository,cacheService,logRepository,eventPublisher);

export const CreateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { name, email } = request.body as { name: string; email: string };

  try {
    await userService.createUser(name, email);
    reply.code(201).send({message: "User created successfully"});
  } catch (error) {
    reply.code(400).send({ message: (error as Error).message });
  }
};

export const GetUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  const users = await userService.findAllUsers();
  reply.code(200).send(users);
};

export const findByEmail = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email } = request.query as { email?: string };
  if (!email) {
    reply.code(400).send({ message: 'Email is required' });
    return;
  }
  const user = await userService.findByEmail(email);
  reply.code(200).send(user);
};

export const getAllLogs = async (request: FastifyRequest, reply: FastifyReply) => {
  const logs = await logRepository.getAllLogs();
  reply.code(200).send(logs);
}

