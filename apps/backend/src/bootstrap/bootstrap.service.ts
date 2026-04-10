import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';
import { db } from '../db';
import { questions } from '../db/schema';
import { SEED_QUESTIONS } from '../db/seed.data';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);
  private readonly pgClient: Client;

  constructor() {
    this.pgClient = new Client({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.run();
  }

  async run(): Promise<void> {
    const isProduction = process.env.NODE_ENV === 'production';
    const skipMigrations = process.env.SKIP_MIGRATIONS === 'true';
    const skipSeed = process.env.SKIP_SEED === 'true';

    if (skipMigrations) {
      this.logger.log('Skipping migrations (SKIP_MIGRATIONS=true)');
    } else {
      await this.runMigrations();
    }

    if (skipSeed) {
      this.logger.log('Skipping seed (SKIP_SEED=true)');
    } else if (isProduction) {
      await this.seed();
    } else {
      this.logger.log('Skipping seed in non-production environment');
    }
  }

  private async runMigrations(): Promise<void> {
    this.logger.log('Running database migrations...');

    try {
      await this.pgClient.connect();

      await this.pgClient.query(`CREATE EXTENSION IF NOT EXISTS vector`);

      await this.pgClient.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(100) NOT NULL,
          improvement_topics TEXT[],
          last_interview_date TIMESTAMP,
          avatar TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await this.pgClient.query(`
        CREATE TABLE IF NOT EXISTS questions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          topic_id VARCHAR(100) NOT NULL,
          subtopic_id VARCHAR(100) NOT NULL,
          level VARCHAR(20) NOT NULL,
          question TEXT NOT NULL,
          follow_ups TEXT[],
          tags TEXT[],
          embedding VECTOR(768),
          expected_answer TEXT,
          criteria TEXT[],
          keywords TEXT[],
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await this.pgClient.query(`
        CREATE TABLE IF NOT EXISTS interviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(100) NOT NULL,
          topic_id VARCHAR(100) NOT NULL,
          subtopic_id VARCHAR(100) NOT NULL,
          level VARCHAR(20) NOT NULL,
          interviewer_name VARCHAR(100) NOT NULL,
          candidate_name VARCHAR(100),
          messages_json TEXT,
          messages_text TEXT,
          messages_embedding VECTOR(768),
          duration INTEGER NOT NULL DEFAULT 0,
          started_at TIMESTAMP NOT NULL,
          ended_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await this.pgClient.query(`
        CREATE TABLE IF NOT EXISTS interview_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
          role VARCHAR(20) NOT NULL,
          text TEXT NOT NULL,
          embedding VECTOR(768),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await this.pgClient.query(`
        CREATE TABLE IF NOT EXISTS evaluations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          interview_id VARCHAR(100) NOT NULL,
          topic_id VARCHAR(100) NOT NULL,
          subtopic_id VARCHAR(100) NOT NULL,
          level VARCHAR(20) NOT NULL,
          overall_score INTEGER NOT NULL,
          question_evaluations TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await this.pgClient.query(`CREATE INDEX IF NOT EXISTS idx_questions_embedding ON questions USING hnsw (embedding vector_cosine_ops)`);
      await this.pgClient.query(`CREATE INDEX IF NOT EXISTS idx_interviews_embedding ON interviews USING hnsw (messages_embedding vector_cosine_ops)`);
      await this.pgClient.query(`CREATE INDEX IF NOT EXISTS idx_interview_messages_embedding ON interview_messages USING hnsw (embedding vector_cosine_ops)`);
      await this.pgClient.query(`CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews (user_id)`);
      await this.pgClient.query(`CREATE INDEX IF NOT EXISTS idx_interview_messages_interview_id ON interview_messages (interview_id)`);

      await this.pgClient.end();

      this.logger.log('Migrations completed successfully');
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }

  private async seed(): Promise<void> {
    this.logger.log('Checking if seed data already exists...');

    const seedClient = new Client({ connectionString: process.env.DATABASE_URL });
    await seedClient.connect();

    try {
      const result = await seedClient.query('SELECT count(*) FROM questions');
      const count = parseInt(result.rows[0].count);
      this.logger.log(`Found ${count} existing questions`);

      if (count > 0) {
        this.logger.log(`Seed data already exists. Skipping seed.`);
        return;
      }
    } catch (error) {
      this.logger.error(`Error checking seed data: ${error.message || error}`);
      await seedClient.end();
      return;
    }

    this.logger.log('Seeding database with initial data (without embeddings)...');

    for (let i = 0; i < SEED_QUESTIONS.length; i++) {
      const q = SEED_QUESTIONS[i];
      this.logger.log(`[${i + 1}/${SEED_QUESTIONS.length}] Seeding: ${q.topicId}/${q.subtopicId} (${q.level})`);

      try {
        await seedClient.query(
          `INSERT INTO questions (topic_id, subtopic_id, level, question, follow_ups, tags, expected_answer, criteria, keywords)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [q.topicId, q.subtopicId, q.level, q.question, q.followUps, q.tags, q.expectedAnswer, q.criteria, q.keywords]
        );

        this.logger.log(`  ✅ Seeded: ${q.topicId}/${q.subtopicId}`);
      } catch (error) {
        this.logger.error(`  ❌ Failed to seed: ${error.message || error}`);
      }
    }

    await seedClient.end();
    this.logger.log('Seed completed successfully');
  }
}
