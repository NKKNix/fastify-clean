import { EventStoreDBClient, JSONEventData } from "@eventstore/db-client";
import { Event } from "../../domain/entities/user.aggregate";

export class EventStore {
  private client: EventStoreDBClient;

  constructor() {
    this.client = EventStoreDBClient.connectionString("esdb://localhost:2113?tls=false"); // Adjust connection string
  }

  async appendToStream(streamName: string, events: Event[]): Promise<void> {
    // Map events to match the JSONEventData format
    const eventData = events.map((event) => ({
        id: event.id,  // Map event.id to id
        contentType: "application/json",  // Add the required contentType
        type: event.type,  // Map event.type to type
        data: event.data,  // Keep event.data as is
        metadata: event.metadata || undefined,  // Use event.metadata or undefined if not available
    }));

    // Append the event data to the stream
    await this.client.appendToStream(streamName, eventData as JSONEventData[]);
    }

  async readStream(streamName: string): Promise<Event[]> {
  const events: Event[] = [];
    // Iterate through the stream asynchronously
    for await (const event of this.client.readStream(streamName, { fromRevision: "start" })) {
        events.push({
        id: event.event?.id ?? "",
        type: event.event?.type ?? "",
        data: event.event?.data,
        metadata: event.event?.metadata || {},
        });
    }

    return events;
    }

}
