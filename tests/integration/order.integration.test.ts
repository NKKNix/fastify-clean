// tests/integration/order.integration.test.ts

import { FastifyInstance } from 'fastify';
import request from 'supertest';
import { build } from '../../src/app'; // import build function ที่ refactor แล้ว
import { OrderService } from '../../src/services/orderService';
import { prisma } from '../../src/infrastructure/services/prisma';

describe('Order API - Integration Tests', () => {
  let app: FastifyInstance;
  let mockOrderService: jest.Mocked<OrderService>;

  beforeAll(() => {
    // 1. สร้าง Mock Service ด้วย jest.fn()
    // เราจำลองแค่ function ที่จะถูกเรียกใช้ใน test case นี้
    mockOrderService = {
      placeOrder: jest.fn(),
      getAllOrders: jest.fn(),
      createOrderEvent: jest.fn(),
    } as any;

    // 2. Build Fastify app โดย "ฉีด" Mock Service เข้าไป
    app = build({
      orderService: mockOrderService,
    });
    
    // รอให้ Fastify พร้อมทำงาน
    app.ready();
  });

  afterEach(() => {
    // Reset mock-up ทุกครั้งหลังจบแต่ละ test case
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  // --- Test Case 1: การสร้าง Order สำเร็จ ---
  describe('POST /createOrder', () => {
    it('should return 201 and success message when order is placed successfully', async () => {
      // Arrange: กำหนดข้อมูลที่จะส่งไป
      const payload = {
        name: 'gg@gmail.com',
        order: [{ productId: 'c1', qty: 2 }],
      };

      // Arrange: กำหนดว่าเมื่อ mock service ถูกเรียก จะไม่ทำอะไร (resolve เป็น void)
      mockOrderService.placeOrder.mockResolvedValue(undefined);

      // Act: ยิง request ไปที่ server จำลอง
      const response = await request(app.server)
        .post('/createOrder')
        .send(payload);

      // Assert: ตรวจสอบผลลัพธ์
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Order placed successfully' });

      // Assert: ตรวจสอบว่า handler เรียก service ถูกต้องหรือไม่
      expect(mockOrderService.placeOrder).toHaveBeenCalledTimes(1);
      expect(mockOrderService.placeOrder).toHaveBeenCalledWith(payload.name, payload.order);
    });

    it('should return 400 if name is missing', async () => {
        // Arrange
        const payload = { order: [{ productId: 'p1', quantity: 2 }] }; // ไม่มี name

        // Act
        const response = await request(app.server)
            .post('/createOrder')
            .send(payload);

        // Assert
        expect(response.status).toBe(400);
        expect(mockOrderService.placeOrder).not.toHaveBeenCalled(); // ตรวจสอบว่า service ไม่ถูกเรียก
    });
  });

  // --- Test Case 2: การดึง Order ทั้งหมด ---
  describe('GET /orders', () => {
    it('should return 200 and a list of orders', async () => {
        // Arrange: กำหนดว่าเมื่อ mock service ถูกเรียก จะให้ return ค่าอะไรกลับมา
        const mockOrders = [{ id: 'order1', total: 100 }, { id: 'order2', total: 200 }];
        mockOrderService.getAllOrders.mockResolvedValue(mockOrders as any);

        // Act
        const response = await request(app.server).get('/orders');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockOrders);
        expect(mockOrderService.getAllOrders).toHaveBeenCalledTimes(1);
    });
  });

  // --- Test Case 3: การสร้าง Order Event สำเร็จ ---
  describe('POST /orders/event', () => { 
    it('should return 201 and success message',async () => {
      const payload = {
        name: 'test',
        order: 'c1',
      };
      mockOrderService.createOrderEvent.mockResolvedValue(undefined);
      const response = await request(app.server)
        .post('/orders/event')
        .send(payload);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({message: "Order placed successfully"});
      expect(mockOrderService.createOrderEvent).toHaveBeenCalledTimes(1);
      expect(mockOrderService.createOrderEvent).toHaveBeenCalledWith({ userId: payload.name, product: payload.order });
    })
    it('should return 400 and error',async () => {
      const payload = {
        name: 'jame23435@gmail.com',
        order: '',
      };
      mockOrderService.createOrderEvent.mockResolvedValue(undefined);
      const response = await request(app.server)
        .post('/orders/event')
        .send(payload);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({message: "Order is required"});
      expect(mockOrderService.createOrderEvent).not.toHaveBeenCalled();
    })
   })
});