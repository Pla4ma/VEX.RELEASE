import type { CoachAgentDecision } from './schemas';

export type AgentDecisionResponse = {
  structuredData?: unknown;
};

export interface InvisibleAgentCardProps {
  decision: CoachAgentDecision | null;
  isPending: boolean;
  isError: boolean;
  onConfirm: (decision: CoachAgentDecision) => void;
  onRetry: () => void;
}
