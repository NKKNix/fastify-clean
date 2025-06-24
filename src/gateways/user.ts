import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserService } from '../service/createUser';
import { PrismaUserRepository } from '../domain/repositories/UserRepository';


const userRepository = new PrismaUserRepository();
const createUserService = new CreateUserService(userRepository, /*...*/);
export const CreateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { name, email } = request.body as { name: string; email: string };

  try {
    const user = await createUserService.execute(name, email);
    reply.code(201).send(user);
  } catch (error) {
    reply.code(400).send({ message: (error as Error).message });
  }
};

export const GetUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  const users = await userRepository.findAll();
  reply.code(200).send(users);
};
