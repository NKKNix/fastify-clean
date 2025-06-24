import { FastifyInstance } from 'fastify';
import { CreateUser, GetUsers } from './user';

export async function userRoute(fastify: FastifyInstance) {
  fastify.post('/users', CreateUser);
  fastify.get('/users', GetUsers);
}