import { UserRepository } from '../domain/repositories/UserRepository';
import { User } from '../domain/entities/User';
import { randomUUID } from 'crypto';

export class CreateUserService {
  constructor(private userRepository: UserRepository) {}

  async execute(name: string, email: string): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user: User = {
      id: randomUUID(),
      name,
      email
    };

    await this.userRepository.create(user);
    return user;
  }
}
