import { LogEntry } from "../entities/LogEntry";
import { EventStoreDBClient, JSONEventData,ResolvedEvent  } from "@eventstore/db-client";

export interface LogRepository {
  create(log: LogEntry): Promise<void>;
  deleteById(id: string): Promise<void>;
  getAllLogs(): Promise<LogEntry[]>;
}

export class EventStoreLogRepository implements LogRepository {
  private readonly eventStoreClient: EventStoreDBClient;

  constructor(eventStoreClient: EventStoreDBClient) {
    this.eventStoreClient = eventStoreClient;
  }

  // Method for creating a new log
  async create(log: LogEntry): Promise<void> {
    const event: JSONEventData = {
      id: log.id,  // log ID is passed to the event's ID
      contentType: "application/json",  // contentType is required as "application/json"
      type: log.eventType,  // Event type indicating a log creation
      data: {
        id: log.id,
        timestamp: log.timestamp.toISOString(),  // Ensure timestamp is a string (ISO format)
        eventType: log.eventType,
        payload: log.payload,
        source: log.source,
      },
      metadata: {} // Optional metadata, you can add more here if needed
    };

    // Append the event to the stream (log-stream)
    await this.eventStoreClient.appendToStream('log-stream', [event]);
  }

  // Method to get all logs from the stream
  async getAllLogs(): Promise<LogEntry[]> {
  const events = await this.eventStoreClient.readStream('log-stream', { fromRevision: 'start' });

  // Map the stream's events to LogEntry objects
  const logs: LogEntry[] = [];
  
  // Iterate over the stream's events
  for await (const resolvedEvent of events) {
    // Check if event exists
    const event = resolvedEvent.event;

    if (!event) {
      // If no event, skip to the next iteration
      continue;
    }

    logs.push({
      id: event.id,  // Access eventId from the event property
      timestamp: new Date(event.created),  // Ensure correct timestamp conversion
      eventType: event.type,  // Access eventType from the event property
      payload: event.data,  // Access payload from the event data
      source: "unknow",  // Access source from the event data
    });
  }

  return logs;
}


  // Method to delete a log by ID (mark as deleted)
  async deleteById(id: string): Promise<void> {
    const event: JSONEventData = {
      id: id,  // log ID is passed to the event's ID
      contentType: "application/json",  // contentType is required as "application/json"
      type: 'LogDeleted',  // Event type indicating a log deletion
      data: { id },  // Data for the event (log ID)
      metadata: {}  // Optional metadata, you can add more here if needed
    };

    // Append the event to the 'log-deleted-stream'
    await this.eventStoreClient.appendToStream('log-deleted-stream', [event]);
  }
}
