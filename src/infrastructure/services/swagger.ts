import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    swagger: {
      info: {
        title: 'Clean API',
        version: '1.0.0',
      },
      tags: [
        { name: 'User', description: 'User-related endpoints' },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
  });
}
