import { InventRepository } from "../domain/repositories/InventRepository";

export class InventoryService {
    constructor(
        private readonly inventoryRepository: InventRepository
    ) {}

    async getInventory(productId: string) {
        return await this.inventoryRepository.findProductById(productId);
    }
    
    async updateStock(productId: string, qty: number) {
        return await this.inventoryRepository.updateStock(productId, qty);
    }

    async addNewProduct(productId: string, initialStock: number) {
        return await this.inventoryRepository.addNewProduct(productId, initialStock);
    }
    async reserveInventory(event: any) {
        try {
        // ตรวจสอบว่า event.payload.product เป็น array หรือไม่
        if (!Array.isArray(event.payload.product)) {
            console.log("Error: event.payload.product is not an array");
        }

        // ประมวลผลข้อมูลที่ได้รับจาก Kafka
        const inventoryUpdates = await Promise.all(
        event.payload.product.map(async (item: any) => {
            // ค้นหาสินค้าในฐานข้อมูล
            const product = await this.inventoryRepository.findProductById(item.productId);
            console.log("this is",product)
            // ตรวจสอบสต๊อกสินค้า
            if (!product) {
                this.inventoryRepository.addNewProduct(item.productId, item.qty);
            }else if (product.stock < item.qty){
                console.log("Inventory not enough");
            }
            // อัปเดตสต๊อกสินค้าในฐานข้อมูล
            try {
                await this.inventoryRepository.updateStock(item.productId, item.qty);
            } catch (error) {
                console.error("Error while reserving inventory:", error);
            }
            
        })
        
        );
        // await sendInventoryReserved(event.id);  // ส่ง event กลับไปที่ Kafka
        console.log("Inventory successfully reserved");
    } catch (error) {
        console.error("Error while reserving inventory:", error);
        // การจัดการกับข้อผิดพลาด เช่น ส่ง event `inventory-failed` กลับไป Kafka
    }

  }
}