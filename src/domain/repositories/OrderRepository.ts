import { Order } from "@prisma/client";
import { prisma } from "../../infrastructure/services/prisma";


export interface OrderRepository {
    create(userId: string, productId: Array<Order>): Promise<void>;
    getAll(): Promise<Order[]>
    createOrderWithEvent(data: { userId: string; product: string },traceContext: object): Promise<void>;
}

export class PrismaOrderRepository implements OrderRepository {
  constructor() {}
  async create(user: string, product: Array<Order>): Promise<void> {
    let sum = 0;
    product.map((item: any) => (sum += item.qty));
    await prisma.order.create({
    data: {
      userId: user,
      totalAmount: sum,
      items: {
        create: product.map((item: any) => ({
          productId: item.productId,
          quantity: item.qty,
        })),
      },
    },
    include: { items: true },
  });
  }
  async getAll(): Promise<Order[]> {
    return await prisma.order.findMany({ include: { items: true } });
  }
  async createOrderWithEvent(data: { userId: string; product: string },traceContext: object): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          totalAmount: 1,
          items: {
            create: {
              productId: data.product,
              quantity: 1,
            },
          },
        },
        include: { items: true },
    })
    await tx.outboxEvent.create({
      data: {
          aggregateId: order.id.toString(),
          eventType: 'ORDER_CREATED',
          payload: {
            // orderId: order.id,
            // customerName: order.userId,
            product: order.items.map((item: any) => ({
              productId: item.productId,
              qty: item.quantity
            })),
            traceContext: traceContext,
          },
        },
      });
    });
  }
}