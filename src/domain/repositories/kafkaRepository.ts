// domain/services/IEventPublisher.ts
import { UserEvent } from '../entities/user.events';

export interface IEventPublisher {
  publish(event: UserEvent): Promise<void>;
}
