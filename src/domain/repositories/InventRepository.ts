import { prisma } from "../../infrastructure/services/prisma";

export interface InventRepository {
    findProductById(productId: string): Promise<any>;
    updateStock(productId: string, qty: number): Promise<any>;
    addNewProduct(productId: string, initialStock: number): Promise<any>;
}

export class PrismaInventRepository implements InventRepository {
    async findProductById(productId: string) {
        return await prisma.inventory.findUnique({
            where: {
            productId: productId,
            },
        });
    }

// อัปเดตสต๊อกสินค้า
    async updateStock(productId: string, qty: number) {
    return await prisma.inventory.update({
        where: { productId: productId },
        data: {
        stock: {
            decrement: qty, // ลดจำนวนสินค้าตามที่ต้องการ
        },
        },
    });
    }

// เพิ่มรายการสินค้าใหม่
    async addNewProduct(productId: string, initialStock: number) {
    return await prisma.inventory.create({
        data: {
        productId: productId,
        stock: initialStock,
        reserved: 0,
        },
    });
    }
}