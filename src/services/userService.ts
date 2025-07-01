import { UserRepository } from '../domain/repositories/UserRepository';
import { User } from '../domain/entities/User';
import { CacheService } from '../domain/entities/Cache';
import { randomUUID } from 'crypto';
import { KafkaPublisher } from '../infrastructure/provider/kafkaProducer';
import { LogRepository } from '../domain/repositories/LogRepository';
import { LogEntry } from '../domain/entities/LogEntry';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cacheService: CacheService,
    private readonly eventRepo: LogRepository,
    private readonly eventPublisher: KafkaPublisher
  ) {}

  async createUser(name: string, email: string): Promise<User> {
    const cached = await this.cacheService.get(email);
    if (cached) {
      throw new Error('User already exists (from cache)');
    }
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user: User = {
      id: randomUUID(),
      name,
      email
    };

    // Create the event for user creation
    const event: LogEntry = {
      id: randomUUID(),
      timestamp: new Date(),
      eventType: 'UserCreated',
      payload: { userId: user.id, name: user.name, email: user.email },  // Payload contains relevant event data
      source: 'service1'  // Can be set dynamically based on the source of the event (e.g., service name)
    };

    // Store the user entity
    await this.userRepository.create(user);

    // Store the user data in cache
    await this.cacheService.set(email, JSON.stringify(user));

    // Store the event in the event repository
    await this.eventRepo.create(event);

    // Publish the event to Kafka
    await this.eventPublisher.publish(event);

    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    const cached = await this.cacheService.get(email);
    if (cached) {
      const user = JSON.parse(cached);
      return user;
    }
    return await this.userRepository.findByEmail(email);
  }
}
