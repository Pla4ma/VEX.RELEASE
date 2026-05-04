-- Migration: Session Stories Table
-- Creates the persistence layer for post-session narrative stories

CREATE TABLE IF NOT EXISTS session_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_data JSONB NOT NULL,
    viewed BOOLEAN NOT NULL DEFAULT FALSE,
    viewed_at BIGINT,
    completion_rate INTEGER NOT NULL DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 100),
    shared_at BIGINT,
    created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_session_stories_session_id ON session_stories(session_id);
CREATE INDEX IF NOT EXISTS idx_session_stories_user_id ON session_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_session_stories_user_created ON session_stories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_stories_unviewed ON session_stories(user_id, viewed) WHERE viewed = FALSE;

-- Row Level Security (RLS)
ALTER TABLE session_stories ENABLE ROW LEVEL SECURITY;

-- Users can only see their own stories
CREATE POLICY "Users can view own stories" ON session_stories
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own stories
CREATE POLICY "Users can insert own stories" ON session_stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own stories (for viewed/shared status)
CREATE POLICY "Users can update own stories" ON session_stories
    FOR UPDATE USING (auth.uid() = user_id);

-- Upsert function for session stories (handles conflicts on session_id)
CREATE OR REPLACE FUNCTION upsert_session_story(
    p_id UUID,
    p_session_id UUID,
    p_user_id UUID,
    p_story_data JSONB,
    p_created_at BIGINT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO session_stories (id, session_id, user_id, story_data, created_at)
    VALUES (p_id, p_session_id, p_user_id, p_story_data, p_created_at)
    ON CONFLICT (session_id) DO UPDATE SET
        story_data = EXCLUDED.story_data,
        created_at = EXCLUDED.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get story engagement stats for a user
CREATE OR REPLACE FUNCTION get_story_engagement_stats(
    p_user_id UUID,
    p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_stories BIGINT,
    viewed_stories BIGINT,
    avg_completion_rate NUMERIC,
    most_engaging_beat_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH story_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE viewed = TRUE) as viewed,
            AVG(completion_rate) as avg_completion,
            story_data->'beats' as beats
        FROM session_stories
        WHERE user_id = p_user_id
        AND created_at >= (extract(epoch from now()) * 1000)::bigint - (p_days_back * 24 * 60 * 60 * 1000)
        GROUP BY story_data
    ),
    beat_counts AS (
        SELECT 
            beat->>'type' as beat_type,
            COUNT(*) as cnt
        FROM story_stats, jsonb_array_elements(beats) as beat
        GROUP BY beat->>'type'
    )
    SELECT 
        (SELECT COUNT(*) FROM story_stats)::BIGINT as total_stories,
        (SELECT SUM(viewed) FROM story_stats)::BIGINT as viewed_stories,
        (SELECT AVG(avg_completion) FROM story_stats)::NUMERIC as avg_completion_rate,
        (SELECT beat_type FROM beat_counts ORDER BY cnt DESC LIMIT 1)::TEXT as most_engaging_beat_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
