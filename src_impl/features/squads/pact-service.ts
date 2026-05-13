import { v4 } from '../../utils/uuid';
import type { CreatePactInput, SquadPact, PactStatus } from './pact-schemas';
import { CreatePactInputSchema, SquadPactSchema } from './pact-schemas';

/**
 * Squad Pacts Service
 * Handles high-stakes social accountability logic.
 */

export async function proposePact(input: CreatePactInput, memberIds: string[]): Promise<SquadPact> {
  const validated = CreatePactInputSchema.parse(input);
  
  const pact: SquadPact = {
    id: v4(),
    squadId: validated.squadId,
    title: validated.title,
    description: validated.description,
    goalType: validated.goalType,
    targetValue: validated.targetValue,
    currentValue: 0,
    stakeAmountPerMember: validated.stakeAmount,
    stakeCurrency: validated.stakeCurrency,
    status: 'PROPOSED',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    expiresAt: Date.now() + validated.durationDays * 24 * 60 * 60 * 1000,
    membersInvolved: memberIds,
    committedMemberIds: [],
  };
  
  return SquadPactSchema.parse(pact);
}

/**
 * Evaluates pact status based on current progress and time.
 * Logic: Goal achievement (MET) vs Timeout (FAILED).
 */
export function evaluatePact(pact: SquadPact): SquadPact {
  if (pact.status !== 'ACTIVE') return pact;
  
  const isGoalMet = pact.currentValue >= pact.targetValue;
  const isExpired = Date.now() > pact.expiresAt;
  
  if (isGoalMet) {
    return { ...pact, status: 'MET', updatedAt: Date.now() };
  }
  
  if (isExpired) {
    return { ...pact, status: 'FAILED', updatedAt: Date.now() };
  }
  
  return pact;
}

/**
 * Handles the "Mutual Failure" logic.
 * If any member triggers a critical failure during an active pact, 
 * the entire squad's pact fails immediately.
 */
export function failPactCollectively(pact: SquadPact, failureReason: string): SquadPact {
  if (pact.status !== 'ACTIVE') return pact;
  
  return {
    ...pact,
    status: 'FAILED',
    updatedAt: Date.now(),
    description: `${pact.description} | PACT BROKEN: ${failureReason}`,
  };
}
