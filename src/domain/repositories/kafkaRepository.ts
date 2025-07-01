// domain/services/IEventPublisher.ts
import { LogEntry } from '../entities/LogEntry';


export interface IEventPublisher {
  publish(event: LogEntry): Promise<void>;
}
