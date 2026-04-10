import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { interviews, interviewMessages, type Interview, type NewInterview, type InterviewMessage, type NewInterviewMessage } from '../db/schema';
import { sql, asc } from 'drizzle-orm';

export interface CreateInterviewDto {
  userId: string;
  topicId: string;
  subtopicId: string;
  level: string;
  interviewerName: string;
  candidateName?: string;
  duration: number;
  startedAt: Date;
}

export interface UpdateInterviewDto {
  candidateName?: string;
  messagesJson?: string;
  messagesText?: string;
  messagesEmbedding?: number[];
  duration?: number;
  endedAt?: Date;
}

export interface MessageInput {
  role: 'user' | 'ai';
  text: string;
  embedding?: number[];
}

export interface SearchFilters {
  userId?: string;
  topicId?: string;
  subtopicId?: string;
  level?: string;
}

@Injectable()
export class InterviewsRepository {
  async createInterview(data: CreateInterviewDto): Promise<Interview> {
    const [result] = await db.insert(interviews).values({
      userId: data.userId,
      topicId: data.topicId,
      subtopicId: data.subtopicId,
      level: data.level,
      interviewerName: data.interviewerName,
      candidateName: data.candidateName,
      duration: data.duration,
      startedAt: data.startedAt,
    }).returning();
    return result;
  }

  async updateInterview(id: string, data: UpdateInterviewDto): Promise<Interview | null> {
    const [result] = await db.update(interviews)
      .set({
        ...data,
        messagesEmbedding: data.messagesEmbedding ? data.messagesEmbedding : undefined,
      })
      .where(sql`${interviews.id} = ${id}`)
      .returning();
    return result || null;
  }

  async addMessage(interviewId: string, message: MessageInput): Promise<InterviewMessage> {
    const [result] = await db.insert(interviewMessages).values({
      interviewId,
      role: message.role,
      text: message.text,
      embedding: message.embedding,
    }).returning();
    return result;
  }

  async getInterviewMessages(interviewId: string): Promise<InterviewMessage[]> {
    return db.select()
      .from(interviewMessages)
      .where(sql`${interviewMessages.interviewId} = ${interviewId}`)
      .orderBy(asc(interviewMessages.createdAt));
  }

  async findById(id: string): Promise<Interview | null> {
    const [result] = await db.select()
      .from(interviews)
      .where(sql`${interviews.id} = ${id}`)
      .limit(1);
    return result || null;
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Interview[]> {
    return db.select()
      .from(interviews)
      .where(sql`${interviews.userId} = ${userId}`)
      .orderBy(asc(interviews.createdAt))
      .limit(limit);
  }

  async findSimilar(embedding: number[], limit: number = 10, filters?: SearchFilters): Promise<Interview[]> {
    if (filters?.userId) {
      return db.select()
        .from(interviews)
        .where(sql`${interviews.userId} = ${filters.userId}`)
        .orderBy(sql`${interviews.messagesEmbedding} <=> ${embedding}`)
        .limit(limit);
    }
    if (filters?.topicId) {
      return db.select()
        .from(interviews)
        .where(sql`${interviews.topicId} = ${filters.topicId}`)
        .orderBy(sql`${interviews.messagesEmbedding} <=> ${embedding}`)
        .limit(limit);
    }
    if (filters?.subtopicId) {
      return db.select()
        .from(interviews)
        .where(sql`${interviews.subtopicId} = ${filters.subtopicId}`)
        .orderBy(sql`${interviews.messagesEmbedding} <=> ${embedding}`)
        .limit(limit);
    }
    if (filters?.level) {
      return db.select()
        .from(interviews)
        .where(sql`${interviews.level} = ${filters.level}`)
        .orderBy(sql`${interviews.messagesEmbedding} <=> ${embedding}`)
        .limit(limit);
    }

    return db.select()
      .from(interviews)
      .orderBy(sql`${interviews.messagesEmbedding} <=> ${embedding}`)
      .limit(limit);
  }

  async deleteInterview(id: string): Promise<boolean> {
    const [result] = await db.delete(interviews)
      .where(sql`${interviews.id} = ${id}`)
      .returning();
    return !!result;
  }

  async getInterviewWithMessages(id: string): Promise<{ interview: Interview | null; messages: InterviewMessage[] }> {
    const interview = await this.findById(id);
    const messages = interview ? await this.getInterviewMessages(interview.id) : [];
    return { interview, messages };
  }
}
