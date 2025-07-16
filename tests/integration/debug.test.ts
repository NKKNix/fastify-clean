// tests/integration/debug.test.ts

import { FastifyInstance } from 'fastify';
import request from 'supertest';
import { build } from '../../src/app'; // Import your app's build function
import { OrderService } from '../../src/services/orderService';

describe('Debug Test - Step 2', () => {
  let app: FastifyInstance;

  beforeAll(() => {
    // Create a mock service, as your build function requires it
    const mockOrderService: jest.Mocked<OrderService> = {
      placeOrder: jest.fn(),
      getAllOrders: jest.fn(),
    } as any;

    // Use your application's build function
    app = build({
      orderService: mockOrderService,
    });
    
    // Still add our own simple route for testing
    app.get('/health', async (request, reply) => {
      return { status: 'ok' };
    });

    app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 after building the main app', async () => {
    const response = await request(app.server).get('/health');
    expect(response.status).toBe(200);
  });
});