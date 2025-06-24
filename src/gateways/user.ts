import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../services/createUser';
import { PrismaUserRepository } from '../domain/repositories/UserRepository';
import { RedisCacheService } from '../infrastructure/services/redis';


const userRepository = new PrismaUserRepository();
const cacheService = new RedisCacheService();
const userService = new UserService(userRepository,cacheService);
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
