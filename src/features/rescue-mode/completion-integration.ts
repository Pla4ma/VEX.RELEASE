import {
  getActiveRescuePlan,
  clearActiveRescuePlan,
  saveRescueCompletion,
  saveRescueMemory,
} from './repository';
import {
  buildRescueCompletionRecord,
  buildRescueCompletionMemory,
} from './service';
import type { RescueOutcome } from './schemas';

interface RescueCompletionInput {
  userId: string;
  actualDurationSeconds: number;
  completionPercentage: number;
  sessionMode: string;
  status: string;
}

export async function recordRescueCompletion(
  input: RescueCompletionInput,
): Promise<void> {
  const plan = await getActiveRescuePlan(input.userId);
  if (!plan) {return;}

  let outcome: RescueOutcome;
  if (input.status === 'COMPLETED') {
    outcome = 'completed';
  } else if (input.completionPercentage >= 50) {
    outcome = 'partial';
  } else {
    outcome = 'abandoned';
  }

  const record = buildRescueCompletionRecord(
    plan,
    outcome,
    input.actualDurationSeconds,
  );
  const memory = buildRescueCompletionMemory(plan, outcome);
  await saveRescueCompletion(record);
  await saveRescueMemory(memory);
  await clearActiveRescuePlan(input.userId);
}
