// domain/events/OutboxEvent.ts
export interface OutboxEvent {
  id: string;
  aggregateId: string;
  eventType: string;
  payload: any;
  createdAt?: Date;
  processed: boolean;
}
