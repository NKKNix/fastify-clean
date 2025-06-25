import { UserRepository } from '../domain/repositories/UserRepository';
import { IUserEventRepository } from '../domain/repositories/userEventRepository';
import { User } from '../domain/entities/User';
import { CacheService } from '../domain/entities/Cache';
import { randomUUID } from 'crypto';
import { UserEvent } from '../domain/entities/user.events';

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private cacheService: CacheService,
    private readonly eventRepo: IUserEventRepository
  ) {}

  async execute(name: string, email: string): Promise<User> {
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
    const event: UserEvent = {
      type: 'UserCreated',
      payload: {
        userId: user.id,
        name: user.name
      },
      timestamp: Date.now()
    };
    
    await this.userRepository.create(user);
    await this.cacheService.set(email, JSON.stringify(user));
    await this.eventRepo.saveEvent(user.id,event);
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
  async getAllEventsLog(): Promise<UserEvent[]> {
    return await this.eventRepo.getAllEvents();
  }
}
