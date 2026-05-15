-- ============================================================================
-- Study from Content Feature - Database Schema
-- V1 Implementation
-- 
-- Product Decisions:
-- - Content retention: 90 days, then soft delete
-- - Rate limit: 10 study plans per user per day
-- - Free in V1
-- - No sharing in V1
-- - Same region storage/database/functions
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Storage Bucket for Temporary File Storage
-- ============================================================================

-- Create storage bucket for study content files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'study-content',
  'study-content',
  false,
  10485760, -- 10MB in bytes
  ARRAY['application/pdf', 'text/plain', 'text/markdown']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Study Content Table (Raw content from user)
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Source metadata
  source_type TEXT NOT NULL CHECK (source_type IN ('PASTE', 'PDF', 'YOUTUBE', 'URL')),
  source_url TEXT,
  original_filename TEXT,
  storage_path TEXT,
  
  -- Extracted content
  title TEXT,
  extracted_text TEXT NOT NULL DEFAULT '',
  extracted_length INTEGER NOT NULL DEFAULT 0,
  language TEXT DEFAULT 'en',
  
  -- User editing
  user_edited_text TEXT,
  is_user_edited BOOLEAN NOT NULL DEFAULT false,
  
  -- Processing status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EXTRACTING', 'EXTRACTED', 'PROCESSING', 'READY', 'FAILED')),
  error_message TEXT,
  
  -- Rate limiting / daily tracking
  generation_count_today INTEGER NOT NULL DEFAULT 0,
  last_generation_date DATE,
  
  -- Soft delete for 90-day retention
  deleted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extracted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT check_storage_path_required CHECK (
    (source_type = 'PDF' AND storage_path IS NOT NULL) OR
    (source_type != 'PDF')
  ),
  CONSTRAINT check_source_url_required CHECK (
    (source_type = 'YOUTUBE' AND source_url IS NOT NULL) OR
    (source_type = 'URL' AND source_url IS NOT NULL) OR
    (source_type NOT IN ('YOUTUBE', 'URL'))
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_study_content_user_id ON study_content(user_id);
CREATE INDEX IF NOT EXISTS idx_study_content_status ON study_content(status);
CREATE INDEX IF NOT EXISTS idx_study_content_deleted_at ON study_content(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_study_content_created_at ON study_content(created_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_study_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_study_content_updated_at ON study_content;
CREATE TRIGGER trigger_study_content_updated_at
  BEFORE UPDATE ON study_content
  FOR EACH ROW
  EXECUTE FUNCTION update_study_content_updated_at();

-- ============================================================================
-- Study Generations Table (AI-generated study plans)
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_generations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES study_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Generation metadata
  model TEXT NOT NULL DEFAULT 'gemini-2.5-pro',
  generation_version TEXT NOT NULL DEFAULT '1.0.0',
  processing_time_ms INTEGER,
  
  -- Generated content
  summary TEXT,
  key_concepts TEXT[] DEFAULT '{}',
  
  -- Study plan components (stored as JSONB for flexibility)
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  quiz_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  session_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- User feedback
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  was_helpful BOOLEAN,
  
  -- Usage tracking
  times_used INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Soft delete (cascade with content)
  deleted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_study_generations_content_id ON study_generations(content_id);
CREATE INDEX IF NOT EXISTS idx_study_generations_user_id ON study_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_study_generations_deleted_at ON study_generations(deleted_at) WHERE deleted_at IS NULL;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_study_generations_updated_at ON study_generations;
CREATE TRIGGER trigger_study_generations_updated_at
  BEFORE UPDATE ON study_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_study_content_updated_at();

-- ============================================================================
-- Study Packs Table (User-organized collections)
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_packs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Organization
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  color TEXT,
  
  -- Content references
  content_ids UUID[] DEFAULT '{}',
  
  -- Progress tracking
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  
  -- Usage
  last_studied_at TIMESTAMPTZ,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_study_packs_user_id ON study_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_study_packs_deleted_at ON study_packs(deleted_at) WHERE deleted_at IS NULL;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_study_packs_updated_at ON study_packs;
CREATE TRIGGER trigger_study_packs_updated_at
  BEFORE UPDATE ON study_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_study_content_updated_at();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE study_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_packs ENABLE ROW LEVEL SECURITY;

-- Study Content Policies
DROP POLICY IF EXISTS "Users can only access own study content" ON study_content;
CREATE POLICY "Users can only access own study content"
  ON study_content FOR ALL
  USING (user_id = auth.uid());

-- Study Generations Policies
DROP POLICY IF EXISTS "Users can only access own study generations" ON study_generations;
CREATE POLICY "Users can only access own study generations"
  ON study_generations FOR ALL
  USING (user_id = auth.uid());

-- Study Packs Policies
DROP POLICY IF EXISTS "Users can only access own study packs" ON study_packs;
CREATE POLICY "Users can only access own study packs"
  ON study_packs FOR ALL
  USING (user_id = auth.uid());

-- Storage Policies
DROP POLICY IF EXISTS "Users can only access own study files" ON storage.objects;
CREATE POLICY "Users can only access own study files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'study-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to check and update daily generation limit
CREATE OR REPLACE FUNCTION check_daily_generation_limit(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(can_generate BOOLEAN, remaining INTEGER) AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_last_date DATE;
  v_count INTEGER;
BEGIN
  -- Get current count for today
  SELECT last_generation_date, generation_count_today
  INTO v_last_date, v_count
  FROM study_content
  WHERE user_id = p_user_id
  ORDER BY last_generation_date DESC
  LIMIT 1;
  
  -- Reset if it's a new day
  IF v_last_date IS NULL OR v_last_date < v_today THEN
    RETURN QUERY SELECT true::BOOLEAN, p_limit::INTEGER;
  END IF;
  
  -- Check limit
  IF v_count >= p_limit THEN
    RETURN QUERY SELECT false::BOOLEAN, (p_limit - v_count)::INTEGER;
  ELSE
    RETURN QUERY SELECT true::BOOLEAN, (p_limit - v_count)::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete content older than 90 days
CREATE OR REPLACE FUNCTION soft_delete_old_content()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  UPDATE study_content
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL
    AND created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Cascade to generations and packs
  UPDATE study_generations
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL
    AND content_id IN (
      SELECT id FROM study_content WHERE deleted_at IS NOT NULL
    );
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE study_content IS 'Raw content submitted by users for study generation';
COMMENT ON TABLE study_generations IS 'AI-generated study plans with tasks and quizzes';
COMMENT ON TABLE study_packs IS 'User-organized collections of study content';
COMMENT ON COLUMN study_content.status IS 'PENDING->EXTRACTING->EXTRACTED->PROCESSING->READY->FAILED';
COMMENT ON COLUMN study_content.generation_count_today IS 'Tracks daily usage for rate limiting (10/day)';
COMMENT ON COLUMN study_content.deleted_at IS '90-day retention policy - soft delete';
