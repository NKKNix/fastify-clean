import { UserEvent } from '../../domain/entities/user.events';
import { IUserEventRepository } from './userEventRepository';
import { prisma } from '../../infrastructure/services/prisma';

export class PrismaEventStoreRepository implements IUserEventRepository {
  async saveEvent(aggregateId: string, event: UserEvent): Promise<void> {
    await prisma.event.create({
      data: {
        aggregateId,
        type: event.type,
        payload: event.payload,
        timestamp: new Date(event.timestamp),
      },
    });
  }

  async getEvents(aggregateId: string): Promise<UserEvent[]> {
    const records = await prisma.event.findMany({
      where: { aggregateId },
      orderBy: { timestamp: 'asc' },
    });

    return records.map(this.mapToUserEvent);
  }

  async getAllEvents(): Promise<UserEvent[]> {
    const records = await prisma.event.findMany({
      orderBy: { timestamp: 'asc' },
    });

    return records.map(this.mapToUserEvent);
  }

  private mapToUserEvent(record: any): UserEvent {
    switch (record.type) {
      case 'UserCreated':
        return {
          type: 'UserCreated',
          payload: record.payload as { userId: string; name: string },
          timestamp: new Date(record.timestamp).getTime(),
        };
      case 'UserUpdated':
        return {
          type: 'UserUpdated',
          payload: record.payload as { userId: string; name: string },
          timestamp: new Date(record.timestamp).getTime(),
        };
      default:
        throw new Error(`Unknown event type: ${record.type}`);
    }
  }
}
