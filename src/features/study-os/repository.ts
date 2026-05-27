import { storage } from "../../store/mmkv-storage";
import { StudyPlanSchema, type StudyPlan } from "./schemas";

const KEY_PREFIX = "study-os:";

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export async function listStoredStudyPlans(
  userId: string,
): Promise<StudyPlan[]> {
  const raw = storage.getString(keyFor(userId));
  if (!raw) return [];
  return StudyPlanSchema.array().parse(JSON.parse(raw));
}

export async function upsertStoredStudyPlan(
  plan: StudyPlan,
): Promise<StudyPlan> {
  const parsed = StudyPlanSchema.parse(plan);
  const existing = await listStoredStudyPlans(parsed.userId);
  const next = [parsed, ...existing.filter((item) => item.id !== parsed.id)];
  storage.set(keyFor(parsed.userId), JSON.stringify(next));
  return parsed;
}
