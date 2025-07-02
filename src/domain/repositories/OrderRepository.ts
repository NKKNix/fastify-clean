import { Order } from "@prisma/client";
import { prisma } from "../../infrastructure/services/prisma";


export interface OrderRepository {
    create(userId: string, productId: Array<Order>): Promise<void>;
    getAll(): Promise<Order[]>
}

export class PrismaOrderRepository implements OrderRepository {
  constructor() {}
  async create(user: string, product: Array<Order>): Promise<void> {
    await prisma.order.create({
    data: {
      userId: user,
      totalAmount: 1000,
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
}