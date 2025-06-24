import { FastifyInstance } from 'fastify';
import * as gateways from './user';

export async function userRoute(fastify: FastifyInstance) {
  fastify.post('/users', gateways.CreateUser);
  fastify.get('/users', gateways.GetUsers);
  fastify.get('/users/test', gateways.findByEmail);
}