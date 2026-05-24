import type { ChallengeType } from './types';

export interface CreationChallenge {
  challenge: string;
  type: ChallengeType;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  resolution: string;
  learning: string;
}

export interface InspirationSource {
  source: string;
  type: InspirationType;
  influence: number; // 0-100
  integration: string;
}

export type InspirationType = 'personal' | 'literary' | 'historical' | 'cultural' | 'natural' | 'artistic' | 'philosophical' | 'scientific';

export interface RevisionHistory {
  versions: RevisionVersion[];
  feedback: FeedbackSource[];
  changes: MajorChange[];
  learning: RevisionLearning;
}

export interface RevisionVersion {
  version: string;
  date: Date;
  changes: string[];
  reason: string;
  effectiveness: number; // 0-100
}

export interface FeedbackSource {
  source: string;
  type: FeedbackType;
  feedback: string[];
  incorporation: number; // 0-100
}

export type FeedbackType = 'beta_reader' | 'editor' | 'workshop' | 'professional' | 'peer' | 'self';

export interface MajorChange {
  change: string;
  type: ChangeType;
  timing: number; // version number
  reason: string;
  impact: string;
}

export type ChangeType = 'structural' | 'character' | 'plot' | 'theme' | 'style' | 'tonal';

export interface RevisionLearning {
  insights: string[];
  improvements: string[];
  techniques: string[];
  growth: string[];
}

// Event Types
export interface SessionStoryEvent {
  type: 'story_created' | 'story_updated' | 'chapter_added' | 'character_developed' | 'choice_made' | 'story_completed';
  userId: string;
  sessionId: string;
  storyId: string;
  data: Record<string, any>;
  timestamp: Date;
}
