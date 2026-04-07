import { pgTable, text, timestamp, uuid, varchar, vector } from 'drizzle-orm/pg-core';

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: varchar('topic_id', { length: 100 }).notNull(),
  subtopicId: varchar('subtopic_id', { length: 100 }).notNull(),
  level: varchar('level', { length: 20 }).notNull(), // 'mid' | 'senior'
  question: text('question').notNull(),
  followUps: text('follow_ups').array(),
  tags: text('tags').array(),
  embedding: vector('embedding', { dimensions: 768 }), // pgvector
  createdAt: timestamp('created_at').defaultNow(),
});
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;