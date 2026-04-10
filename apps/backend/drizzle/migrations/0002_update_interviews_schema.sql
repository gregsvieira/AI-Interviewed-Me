-- Migration: Add missing columns to interviews and create interview_messages table
-- Enable pgvector extension if not exists
CREATE EXTENSION IF NOT EXISTS vector;

-- Add missing columns to interviews table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interviews' AND column_name = 'candidate_name') THEN
    ALTER TABLE interviews ADD COLUMN candidate_name VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interviews' AND column_name = 'messages_text') THEN
    ALTER TABLE interviews ADD COLUMN messages_text TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interviews' AND column_name = 'messages_embedding') THEN
    ALTER TABLE interviews ADD COLUMN messages_embedding VECTOR(768);
  END IF;
END $$;

-- Drop existing interview_messages table if exists and recreate with correct schema
DROP TABLE IF EXISTS interview_messages CASCADE;

-- Create interview_messages table
CREATE TABLE interview_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  text TEXT NOT NULL,
  embedding VECTOR(768),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
DROP INDEX IF EXISTS idx_interviews_embedding_hnsw;
CREATE INDEX idx_interviews_embedding_hnsw ON interviews USING hnsw (messages_embedding vector_cosine_ops);

DROP INDEX IF EXISTS idx_interview_messages_embedding_hnsw;
CREATE INDEX idx_interview_messages_embedding_hnsw ON interview_messages USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews (user_id);
CREATE INDEX IF NOT EXISTS idx_interview_messages_interview_id ON interview_messages (interview_id);
