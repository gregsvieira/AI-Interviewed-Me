import { integer, pgTable, text, timestamp, uuid, varchar, vector } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  improvementTopics: text('improvement_topics').array(),
  lastInterviewDate: timestamp('last_interview_date'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: varchar('topic_id', { length: 100 }).notNull(),
  subtopicId: varchar('subtopic_id', { length: 100 }).notNull(),
  level: varchar('level', { length: 20 }).notNull(),
  question: text('question').notNull(),
  followUps: text('follow_ups').array(),
  tags: text('tags').array(),
  embedding: vector('embedding', { dimensions: 768 }),
  expectedAnswer: text('expected_answer'),
  criteria: text('criteria').array(),
  keywords: text('keywords').array(),
  createdAt: timestamp('created_at').defaultNow(),
});
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export const evaluations = pgTable('evaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  interviewId: varchar('interview_id', { length: 100 }).notNull(),
  topicId: varchar('topic_id', { length: 100 }).notNull(),
  subtopicId: varchar('subtopic_id', { length: 100 }).notNull(),
  level: varchar('level', { length: 20 }).notNull(),
  overallScore: integer('overall_score').notNull(),
  questionEvaluations: text('question_evaluations'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const interviews = pgTable('interviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  topicId: varchar('topic_id', { length: 100 }).notNull(),
  subtopicId: varchar('subtopic_id', { length: 100 }).notNull(),
  level: varchar('level', { length: 20 }).notNull(),
  interviewerName: varchar('interviewer_name', { length: 100 }).notNull(),
  candidateName: varchar('candidate_name', { length: 100 }),
  messagesJson: text('messages_json'),
  messagesText: text('messages_text'),
  messagesEmbedding: vector('messages_embedding', { dimensions: 768 }),
  duration: integer('duration').notNull().default(0),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;

export const interviewMessages = pgTable('interview_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  interviewId: uuid('interview_id').notNull().references(() => interviews.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(),
  text: text('text').notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export type InterviewMessage = typeof interviewMessages.$inferSelect;
export type NewInterviewMessage = typeof interviewMessages.$inferInsert;
