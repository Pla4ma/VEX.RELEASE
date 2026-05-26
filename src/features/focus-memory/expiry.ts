import type { FocusMemory, FocusMemoryType } from './schemas';

const DAY_MS = 24 * 60 * 60 * 1000;

export function expiryForType(type: FocusMemoryType, createdAt: number): number | null {
  if (type === 'preferred_tone' || type === 'project_continuity' || type === 'friction_preference') {
    return null;
  }
  if (type === 'successful_session_pattern') return createdAt + 45 * DAY_MS;
  if (type === 'lane_evidence') return createdAt + 60 * DAY_MS;
  if (type === 'study_deadline') return createdAt + 7 * DAY_MS;
  return createdAt + 30 * DAY_MS;
}

export function isSensitiveMemory(type: FocusMemoryType): boolean {
  return type === 'study_deadline' || type === 'project_continuity';
}

export function contentScopeForSource(source: FocusMemory['source']): 'task_only' | 'general' {
  if (source === 'import') return 'task_only';
  return 'general';
}
