import type { CoachAgentDecision } from '../../../features/invisible-agent';

export type HomeAgentIntent = 'start-session' | 'continue-study' | 'review-progress';

export function resolveHomeAgentIntent(decision: CoachAgentDecision): HomeAgentIntent {
  switch (decision.type) {
    case 'CONTINUE_STUDY_PLAN':
      return 'continue-study';
    case 'REVIEW_PROGRESS':
    case 'NO_ACTION':
      return 'review-progress';
    case 'RESCUE_STREAK':
    case 'START_SESSION':
      return 'start-session';
  }
}

export function homeAgentActionLabel(decision: CoachAgentDecision): string {
  switch (decision.type) {
    case 'RESCUE_STREAK':
      return 'Start rescue';
    case 'CONTINUE_STUDY_PLAN':
      return 'Continue study';
    case 'REVIEW_PROGRESS':
    case 'NO_ACTION':
      return 'Review progress';
    case 'START_SESSION':
      return 'Start focus';
  }
}
