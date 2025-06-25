import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../services/userService';
import { PrismaUserRepository } from '../domain/repositories/UserRepository';
import { RedisCacheService } from '../infrastructure/services/redis';
import { PrismaEventStoreRepository } from '../domain/repositories/prismaEventStore';
import { KafkaPublisher } from '../infrastructure/provider/kafkaProducer';

const userEventRepository = new PrismaEventStoreRepository();
const userRepository = new PrismaUserRepository(userEventRepository);
const cacheService = new RedisCacheService();
const eventPublisher = new KafkaPublisher();
const userService = new UserService(userRepository,cacheService,userEventRepository,eventPublisher);

export const CreateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { name, email } = request.body as { name: string; email: string };

  try {
    const user = await userService.execute(name, email);
    reply.code(201).send(user);
  } catch (error) {
    reply.code(400).send({ message: (error as Error).message });
  }
};

export const GetUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  const users = await userRepository.findAll();
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

export const getLog = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id?: string };
  if (!id) {
    reply.code(400).send({ message: 'Id is required' });
    return;
  }
  const events = await userRepository.getLog(id);
  reply.code(200).send(events);
};

export const getAllEventLog = async (request: FastifyRequest, reply: FastifyReply) => {
  const events = await userService.getAllEventsLog();
  reply.code(200).send(events);
};
