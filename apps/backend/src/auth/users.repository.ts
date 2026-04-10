import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { users, type User } from '../db/schema';
import { sql, eq } from 'drizzle-orm';

@Injectable()
export class UsersRepository {
  async findById(id: string): Promise<User | null> {
    const [result] = await db.select()
      .from(users)
      .where(sql`${users.id} = ${id}`)
      .limit(1);
    return result || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [result] = await db.select()
      .from(users)
      .where(sql`${users.email} = ${email}`)
      .limit(1);
    return result || null;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    improvementTopics: string[];
  }): Promise<User> {
    const [result] = await db.insert(users).values({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      improvementTopics: data.improvementTopics,
    }).returning();
    return result;
  }

  async update(id: string, updates: Partial<{
    name: string;
    improvementTopics: string[];
    lastInterviewDate: Date;
    avatar: string;
  }>): Promise<User | null> {
    const [result] = await db.update(users)
      .set(updates)
      .where(sql`${users.id} = ${id}`)
      .returning();
    return result || null;
  }
}
