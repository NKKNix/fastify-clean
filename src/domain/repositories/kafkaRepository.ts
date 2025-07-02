// domain/services/IEventPublisher.ts
import { LogEntry } from '../entities/LogEntry';


export interface IEventPublisher {
  publish(event: LogEntry, topic: string): Promise<void>;
}
