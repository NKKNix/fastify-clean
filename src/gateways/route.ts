import * as gateways from './user';
import * as h from './order';
import { FastifyInstance } from 'fastify';



export async function userRoute(app: FastifyInstance) {
  app.post('/users', gateways.CreateUser);
  app.get('/users', gateways.GetUsers);
  app.get('/users/test', gateways.findByEmail);
  app.get('/users/logs', gateways.getAllLogs);
  app.post('/createOrder', h.CreateOrder);
  app.get('/orders', h.GetAllOrders);
  app.get('/orders',{ handler: h.GetAllOrders });
  // app.get('/users/:id', async (req, reply) => {
  //   const { id } = req.params as any;
  //   const events = await repo.getEvents(id);
  //   const user = new User(events);
  //   reply.send(user);
  // });
}