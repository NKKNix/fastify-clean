import { FastifyInstance } from 'fastify';
import * as gateways from './user';


export async function userRoute(fastify: FastifyInstance) {
  fastify.post('/users', gateways.CreateUser);
  fastify.get('/users', gateways.GetUsers);
  fastify.get('/users/test', gateways.findByEmail);
  fastify.get('/users/:id/logs', gateways.getLog);
  fastify.get('/users/logs',gateways.getAllEventLog)

  // fastify.get('/users/:id', async (req, reply) => {
  //   const { id } = req.params as any;
  //   const events = await repo.getEvents(id);
  //   const user = new User(events);
  //   reply.send(user);
  // });
}