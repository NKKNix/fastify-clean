import * as userHandler from './user';
import { FastifyInstance } from 'fastify';
import { createUserSchema, getByEmailSchema, getUserLogSchema, getUserSchema } from '../schemas/user.schema';
import { createOrderSchema } from '../schemas/order.schema';
import { createOrderHandler } from './order';
import { OrderService } from '../services/orderService';

export interface AppDependencies {
  orderService: OrderService;
  // userService, ...etc
}

export async function registerRoutes(app: FastifyInstance,deps: AppDependencies) {
  const orderHandler = createOrderHandler(deps.orderService);
  app.post('/users', {handler: userHandler.CreateUser, schema: createUserSchema});
  app.get('/users', {handler: userHandler.GetUsers, schema: getUserSchema});
  app.get('/users/test', {handler: userHandler.findByEmail, schema: getByEmailSchema});
  app.get('/users/logs', {handler:userHandler.getAllLogs,schema: getUserLogSchema});
  app.post('/createOrder', {handler: orderHandler.CreateOrder, 
    schema: createOrderSchema
  });
  app.get('/orders', orderHandler.GetAllOrders);
  app.post('/orders/event', orderHandler.CreateOrderWithEvent);
}