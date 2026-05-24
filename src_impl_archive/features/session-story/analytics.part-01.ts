/**
 * Session Story Feature Analytics
 *
 * Comprehensive analytics tracking for narrative generation, storytelling, and session chronicles features.
 */
// ============================================================================
// STORY LIFECYCLE ANALYTICS
// ============================================================================
import { capture } from '../../shared/analytics/analytics-service';

export function trackStoryGenerated(
  userId: string,
  sessionId: string,
  storyId: string,
  generationType: 'automatic' | 'manual' | 'hybrid' | 'template',
  generationTime: number,
  narrative: {
    title: string;
    genre: string;
    theme: string;
    tone: string;
    length: string;
  },
  structure: {
    chapters: number;
    scenes: number;
    characters: number;
    events: number;
    choices: number;
  },
  personalization: {
    adapted: boolean;
    userElements: string[];
    preferences: string[];
    history: string[];
  },
): void {
  capture('session_story_generated', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    generation_type: generationType,
    generation_time: generationTime,
    narrative,
    structure,
    personalization,
  });
}

export function trackStoryStarted(
  userId: string,
  sessionId: string,
  storyId: string,
  startType: 'beginning' | 'resume' | 'jump_in' | 'preview',
  chapter: number,
  scene: number,
  context: {
    previousSession?: string;
    bookmark?: string;
    progress: number;
  },
  expectations: {
    estimatedDuration: number;
    difficulty: string;
    engagement: string;
    outcomes: string[];
  },
): void {
  capture('session_story_started', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    start_type: startType,
    chapter,
    scene,
    context,
    expectations,
  });
}

export function trackStoryProgressed(
  userId: string,
  sessionId: string,
  storyId: string,
  progressType: 'chapter' | 'scene' | 'event' | 'milestone' | 'choice',
  previousProgress: {
    chapter: number;
    scene: number;
    percentage: number;
  },
  currentProgress: {
    chapter: number;
    scene: number;
    percentage: number;
  },
  content: {
    title: string;
    description: string;
    significance: string;
    impact: string;
  },
  engagement: {
    timeSpent: number;
    interactions: number;
    choices: number;
    skips: number;
  },
): void {
  capture('session_story_progressed', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    progress_type: progressType,
    previous_progress: previousProgress,
    current_progress: currentProgress,
    content,
    engagement,
  });
}

export function trackStoryCompleted(
  userId: string,
  sessionId: string,
  storyId: string,
  completedAt: Date,
  completionType: 'natural' | 'skipped' | 'abandoned' | 'timeout',
  totalDuration: number,
  finalProgress: {
    chaptersCompleted: number;
    totalChapters: number;
    scenesCompleted: number;
    totalScenes: number;
    percentage: number;
  },
  outcomes: {
    ending: string;
    achievements: string[];
    unlocks: string[];
    rewards: unknown[];
  },
  performance: {
    engagement: number;
    satisfaction: number;
    comprehension: number;
    retention: number;
  },
): void {
  capture('session_story_completed', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    completed_at: completedAt.toISOString(),
    completion_type: completionType,
    total_duration: totalDuration,
    final_progress: finalProgress,
    outcomes,
    performance,
  });
}

// ============================================================================
// NARRATIVE ANALYTICS
// ============================================================================

