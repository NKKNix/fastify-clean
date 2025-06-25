import { UserEvent } from '../entities/user.events';
const eventstore = require('eventstore');
export interface IUserEventRepository {
  saveEvent(userId: string, event: UserEvent): Promise<void>;
  getEvents(userId: string): Promise<UserEvent[]>;
  getAllEvents(): Promise<UserEvent[]>;
}


