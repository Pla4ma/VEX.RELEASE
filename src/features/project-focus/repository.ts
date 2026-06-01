import { storage } from '../../store/mmkv-storage';
import { ProjectThreadSchema, type ProjectThread } from './schemas';

const KEY_PREFIX = 'project-focus:';

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export async function listStoredProjectThreads(
  userId: string,
): Promise<ProjectThread[]> {
  try {
    const raw = storage.getString(keyFor(userId));
    if (!raw) {return [];}
    return ProjectThreadSchema.array().parse(JSON.parse(raw));
  } catch (error: unknown) {
    return [];
  }
}

export async function upsertStoredProjectThread(
  thread: ProjectThread,
): Promise<ProjectThread> {
  const parsed = ProjectThreadSchema.parse(thread);
  try {
    const existing = await listStoredProjectThreads(parsed.userId);
    const next = [parsed, ...existing.filter((item) => item.id !== parsed.id)];
    storage.set(keyFor(parsed.userId), JSON.stringify(next));
  } catch (error: unknown) {
    // Degraded: return parsed thread even if storage fails
  }
  return parsed;
}
