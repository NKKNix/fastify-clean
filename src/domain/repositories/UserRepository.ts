import { User } from '../../domain/entities/User';
import { prisma } from '../../infrastructure/services/prisma';
import { UserEvent } from '../entities/user.events';
import { IUserEventRepository } from './userEventRepository';


export interface UserRepository {
  create(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>
  getLog(id: string) : Promise<UserEvent[]>
}

export class PrismaUserRepository implements UserRepository {
  constructor(private eventRepo: IUserEventRepository) {}
  async create(user: User): Promise<void> {
    await prisma.user.create({ data: user });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? { id: user.id, name: user.name, email: user.email } : null;
  }
  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map(user => ({ id: user.id, name: user.name, email: user.email }));
  }
  async getLog(id: string): Promise<UserEvent[]> {
    const events = await this.eventRepo.getEvents(id);
    return events;
  }
}
