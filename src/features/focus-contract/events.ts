import { eventBus } from '../../events/EventBus';
import type { ReflectionStatus } from './types';

export function publishContractCreated(input: {
  contractId: string;
  sessionId: string;
  userId: string;
}): void {
  eventBus.publish('focus-contract:created', input);
}

export function publishContractReflected(input: {
  contractId: string;
  completionStatus: ReflectionStatus;
  userId: string;
}): void {
  eventBus.publish('focus-contract:reflected', input);
}

export function publishContractSkipped(input: {
  sessionId: string;
  userId: string;
}): void {
  eventBus.publish('focus-contract:skipped', input);
}

export function publishContractDoneMilestone(input: {
  contractId: string;
  userId: string;
}): void {
  eventBus.publish('companion:milestone', {
    userId: input.userId,
    milestoneType: 'focus_contract_done',
    sourceId: input.contractId,
  });
}
