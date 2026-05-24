/**
 * Session Story Event Definitions
 *
 * Events for the post-session narrative system.
 */

import type { SessionStory } from '@/features/session-story/schemas';

export interface SessionStoryEventDefinitions {
  // Story lifecycle events
  'session:story:ready': {
    storyId: string;
    sessionId: string;
    userId: string;
    title: string;
    beatCount: number;
  };

  'session:story:viewed': {
    storyId: string;
    userId: string;
    completionRate: number;
    story?: SessionStory;
  };

  'session:story:beat_viewed': {
    storyId: string;
    userId: string;
    beatType: string;
    sequenceOrder: number;
  };

  'session:story:completed': {
    storyId: string;
    userId: string;
    completionRate: number;
  };

  'session:story:skipped': {
    storyId: string;
    userId: string;
    reason?: string;
  };

  'session:story:shared': {
    storyId: string;
    userId: string;
    sharedTo?: string;
  };

  'session:story:analytics': {
    storyId: string;
    userId: string;
    eventType: string;
    beatType?: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
  };

  'narrative:session_complete': {
    sessionId: string;
    userId: string;
    theme: 'triumph' | 'struggle' | 'comeback' | 'mastery' | 'learning';
    summary: string;
  };
}
