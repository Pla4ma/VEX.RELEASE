/**
 * Companion Events
 */

export interface CompanionEventDefinitions {
  'companion:state_changed': {
    userId: string;
    companionId: string;
    previousPhase?: string;
    newPhase: string;
    previousMood?: string;
    newMood: string;
    level: number;
    totalFocusMinutes: number;
    sessionCount: number;
    reason: string;
    sessionId?: string;
    timestamp: number;
  };
  'companion:evolution': {
    userId: string;
    companionId: string;
    previousPhase: string;
    newPhase: string;
    totalFocusMinutes: number;
    evolutionCeremony: boolean;
    timestamp: number;
  };
  'companion:milestone_reached': {
    userId: string;
    companionId: string;
    milestoneType: string;
    value: number;
    previousValue: number;
    timestamp: number;
  };
  'companion:memory_created': {
    createdAt: string;
    memoryId: string;
    sessionId: string | null;
    type: string;
    userId: string;
  };
  'companion:milestone': {
    userId: string;
    milestoneType: string;
    sourceId?: string;
  };
}
