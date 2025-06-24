import { User } from '../../domain/entities/User';
import { prisma } from '../../infrastructure/database/prisma';


export interface UserRepository {
  create(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

export class PrismaUserRepository implements UserRepository {

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
}
