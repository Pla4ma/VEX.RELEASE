import { getSupabaseClient } from '../../config/supabase';
import { FocusIdentityRepositoryError } from './repository-focus-score-mappers';
import { SessionScoreWriteSchema, SessionScoreWriteResultSchema,
  type SessionScoreWrite, type SessionScoreWriteResult } from './session-score.schemas';

export async function recordSessionFocusScore(input: SessionScoreWrite): Promise<SessionScoreWriteResult> {
  const parsed = SessionScoreWriteSchema.parse(input);
  const { data, error } = await getSupabaseClient().rpc('record_session_focus_score', {
    p_user_id: parsed.userId, p_session_id: parsed.sessionId,
    p_score: parsed.score, p_occurred_at: parsed.occurredAt,
  });
  if (error) { throw new FocusIdentityRepositoryError('recordSessionFocusScore', error); }
  return SessionScoreWriteResultSchema.parse(data);
}
