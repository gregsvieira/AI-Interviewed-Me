-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  improvement_topics TEXT[],
  last_interview_date TIMESTAMP,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create interviews table
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
);

-- Create interview_messages table
CREATE TABLE IF NOT EXISTS interview_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  text TEXT NOT NULL,
  embedding VECTOR(768),
  created_at TIMESTAMP DEFAULT NOW()
);

-- HNSW indexes for vector similarity search
CREATE INDEX IF NOT EXISTS idx_interviews_embedding_hnsw ON interviews USING hnsw (messages_embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_interview_messages_embedding_hnsw ON interview_messages USING hnsw (embedding vector_cosine_ops);

-- B-tree indexes for common queries
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews (user_id);
CREATE INDEX IF NOT EXISTS idx_interview_messages_interview_id ON interview_messages (interview_id);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews (created_at);
