import type { BaseSessionStartEvent } from './base';

export interface SessionMoodAssessedEvent extends BaseSessionStartEvent {
  type: 'session_mood_assessed';
  data: {
    assessmentType:
      | 'self_report'
      | 'behavioral'
      | 'physiological'
      | 'comprehensive';
    moodProfile: {
      energy: number;
      focus: number;
      motivation: number;
      stress: number;
      confidence: number;
      creativity: number;
      social: number;
    };
    moodState: 'optimal' | 'good' | 'neutral' | 'suboptimal' | 'poor';
    influences: { factors: string[]; sources: string[]; timing: string[] };
    recommendations: {
      immediate: string[];
      session: string[];
      postSession: string[];
    };
  };
}

export interface SessionMoodAdjustedEvent extends BaseSessionStartEvent {
  type: 'session_mood_adjusted';
  data: {
    adjustmentType:
      | 'preparation'
      | 'intervention'
      | 'environment'
      | 'social'
      | 'personal';
    adjustmentMethod: string;
    previousMood: Record<string, unknown>;
    currentMood: Record<string, unknown>;
    changes: Array<{ dimension: string; change: number; significance: string }>;
    activities: Array<{
      activity: string;
      duration: number;
      effectiveness: number;
    }>;
    sustainability: {
      duration: number;
      maintenance: string[];
      reinforcement: string[];
    };
  };
}

export interface SessionContextEstablishedEvent extends BaseSessionStartEvent {
  type: 'session_context_established';
  data: {
    contextType:
      | 'personal'
      | 'environmental'
      | 'social'
      | 'temporal'
      | 'situational';
    contextData: {
      personal: {
        preferences: Record<string, unknown>;
        history: Record<string, unknown>;
        patterns: Record<string, unknown>;
      };
      environmental: {
        location: string;
        conditions: string;
        resources: string[];
      };
      social: { alone: boolean; company: string[]; interactions: string[] };
      temporal: {
        timeOfDay: string;
        dayOfWeek: string;
        season: string;
        schedule: string;
      };
      situational: {
        preceding: string;
        following: string;
        constraints: string[];
        opportunities: string[];
      };
    };
    adaptations: { automatic: string[]; manual: string[]; suggested: string[] };
  };
}

export interface SessionContextUpdatedEvent extends BaseSessionStartEvent {
  type: 'session_context_updated';
  data: {
    updateType: 'environmental' | 'personal' | 'social' | 'system' | 'external';
    changes: Array<{
      aspect: string;
      previousValue: Record<string, unknown>;
      newValue: Record<string, unknown>;
      impact: string;
      timestamp: Date;
    }>;
    implications: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    adaptations: { applied: string[]; pending: string[]; rejected: string[] };
  };
}
