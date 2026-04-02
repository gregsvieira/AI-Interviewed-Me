import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StorageService } from '../storage/storage.service';
import { User, UserWithoutPassword } from './entities/user.entity';

const DEFAULT_TOPICS = [
  'softskills',
  'frontend',
  'backend',
  'fullstack',
  'devops',
  'database',
];

export interface AuthResult {
  user: UserWithoutPassword;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private storage: StorageService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string): Promise<AuthResult> {
    const existingUsers = await this.storage.getAll<User>('users');
    if (existingUsers.find(u => u.email === email)) {
      throw new ConflictException('Email already exists');
    }

    const user: User = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date(),
      improvementTopics: [...DEFAULT_TOPICS],
      lastInterviewDate: null,
    };

    await this.storage.save('users', user.id, user);

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.storage.findByField<User>('users', 'email', email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async validateUser(payload: { sub: string; email: string }): Promise<UserWithoutPassword | null> {
    const user = await this.storage.get<User>('users', payload.sub);
    if (!user) return null;
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserById(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.storage.get<User>('users', id);
    if (!user) return null;
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id: string, updates: Partial<Pick<User, 'improvementTopics' | 'lastInterviewDate'>>): Promise<UserWithoutPassword | null> {
    const user = await this.storage.get<User>('users', id);
    if (!user) return null;

    if (updates.improvementTopics !== undefined) {
      user.improvementTopics = updates.improvementTopics;
    }
    if (updates.lastInterviewDate !== undefined) {
      user.lastInterviewDate = updates.lastInterviewDate;
    }

    await this.storage.save('users', user.id, user);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
