export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  items: { productId: string; qty: number }[];
  totalAmount: number;
}
