import { z } from 'zod';
import {
  FocusContractInputSchema,
  FocusContractReflectionInputSchema,
} from './schemas';
import {
  publishContractCreated,
  publishContractDoneMilestone,
  publishContractReflected,
  publishContractSkipped,
} from './events';
import {
  trackContractCompletionRate,
  trackContractCreated,
  trackContractReflected,
  trackContractSkipped,
} from './analytics';
import * as repository from './repository';
import type { FocusContract, FocusContractInput, ReflectionStatus } from './types';

const UserIdSchema = z.string().uuid();
export type ContractReminderStage = 'early' | 'late';

export function getReflectionCopy(status: ReflectionStatus): string {
  if (status === 'done') {
    return "That's focus. Your companion noticed.";
  }
  if (status === 'partial') {
    return 'Partial is honest. Keep showing up.';
  }
  return 'That happens. Next session, try again.';
}

function normalizeTaskDescription(input: FocusContractInput): string {
  const parsed = FocusContractInputSchema.parse(input);
  const task = parsed.taskDescription?.trim() ?? '';
  if (task.length < 3) {
    throw new Error('Focus contract task must be at least 3 characters.');
  }
  return task;
}

export async function createContract(
  input: FocusContractInput,
  userId: string,
): Promise<FocusContract> {
  const parsedUserId = UserIdSchema.parse(userId);
  const taskDescription = normalizeTaskDescription(input);
  const contract = await repository.createContract({
    sessionId: input.sessionId,
    userId: parsedUserId,
    taskDescription,
  });
  publishContractCreated({
    contractId: contract.id,
    sessionId: contract.sessionId,
    userId: parsedUserId,
  });
  trackContractCreated(parsedUserId, contract.sessionId, true);
  return contract;
}

export async function reflectOnContract(
  contractId: string,
  status: ReflectionStatus,
  userId: string,
): Promise<void> {
  const input = FocusContractReflectionInputSchema.parse({
    contractId,
    completionStatus: status,
  });
  const parsedUserId = UserIdSchema.parse(userId);
  await repository.reflectOnContract(input.contractId, input.completionStatus);
  publishContractReflected({
    contractId: input.contractId,
    completionStatus: input.completionStatus,
    userId: parsedUserId,
  });
  trackContractReflected(parsedUserId, input.completionStatus, 0);
  if (input.completionStatus === 'done') {
    publishContractDoneMilestone({ contractId: input.contractId, userId: parsedUserId });
  }
}

export async function skipContract(sessionId: string, userId: string): Promise<void> {
  const parsedSessionId = z.string().uuid().parse(sessionId);
  const parsedUserId = UserIdSchema.parse(userId);
  publishContractSkipped({ sessionId: parsedSessionId, userId: parsedUserId });
  trackContractSkipped(parsedUserId, parsedSessionId);
}

export async function getCompletionRate(userId: string, windowDays: number): Promise<number> {
  const parsedUserId = UserIdSchema.parse(userId);
  const recentContracts = await repository.getRecentContracts(parsedUserId, 3);
  if (recentContracts.length === 0) {
    return 0.5;
  }
  const rate = await repository.getContractCompletionRate(parsedUserId, windowDays);
  const boundedRate = Math.max(0, Math.min(1, rate));
  trackContractCompletionRate(parsedUserId, boundedRate, windowDays);
  return boundedRate;
}

export async function getCompletionSignal(
  userId: string,
  windowDays: number,
): Promise<{ rate: number; completedContractCount: number }> {
  const parsedUserId = UserIdSchema.parse(userId);
  const contracts = await repository.getRecentContracts(parsedUserId, Math.max(3, windowDays * 3));
  const reflectedCount = contracts.filter((contract) => contract.completionStatus !== null).length;
  const rate = reflectedCount === 0
    ? 0.5
    : contracts.filter((contract) => contract.completionStatus === 'done').length / reflectedCount;
  return { rate: Math.max(0, Math.min(1, rate)), completedContractCount: reflectedCount };
}

export async function getContractForSession(
  sessionId: string,
  userId: string,
): Promise<FocusContract | null> {
  return repository.getContractForSession(
    z.string().uuid().parse(sessionId),
    UserIdSchema.parse(userId),
  );
}

export function getContractReminderStage(
  contract: FocusContract | null,
  progressPercentage: number,
): ContractReminderStage | null {
  if (!contract) {
    return null;
  }
  const progress = Math.max(0, Math.min(100, progressPercentage));
  if (progress >= 10 && progress <= 20) {
    return 'early';
  }
  if (progress >= 90) {
    return 'late';
  }
  return null;
}
