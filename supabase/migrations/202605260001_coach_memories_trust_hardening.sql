ALTER TABLE coach_memories
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS evidence_hash TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_coach_memories_user_active
  ON coach_memories(user_id, type)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_coach_memories_evidence_hash
  ON coach_memories(user_id, evidence_hash)
  WHERE evidence_hash IS NOT NULL;
