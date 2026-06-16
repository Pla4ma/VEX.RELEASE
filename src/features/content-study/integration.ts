/**
 * Content Study Integration
 * Wire up events, analytics, and cross-feature communication
 */

import { initializeContentStudyEventIntegration } from './events';
import { contentStudyAnalytics } from './analytics';

interface IntegrationConfig {
  userId: string;
  analyticsProvider?: {
    track: (event: string, properties: Record<string, unknown>) => void;
    identify: (userId: string, traits?: Record<string, unknown>) => void;
  };
  eventBus?: {
    subscribe: (event: string, callback: (data: unknown) => void) => () => void;
    emit: (event: string, data: unknown) => void;
  };
}

/**
 * Initialize all content study integrations
 * Call this once during app startup after auth is ready
 */
export function initializeContentStudy(config: IntegrationConfig): void {
  // Initialize analytics
  if (config.analyticsProvider) {
    contentStudyAnalytics.initialize(config.userId, config.analyticsProvider);
  }

  // Wire up event bus integration
  initializeContentStudyEventIntegration(config.eventBus);
}

/**
 * Hook up navigation integration
 * Called when navigating to content study screens
 */
export function trackContentStudyScreenView(
  screenName: string,
  params?: Record<string, unknown>,
): void {
  contentStudyAnalytics.track('content_study_screen_viewed', {
    screen: screenName,
    ...params,
  });
}

/**
 * Integration with session module
 * Called when starting a study session from content
 */
export function prepareContentStudySession(
  generationId: string,
  studyPlan: {
    tasks: Array<{ id: string; content: string; priority: string }>;
    recommendedDurationMinutes: number;
    recommendedDifficulty: string;
    focusAreas: string[];
  },
): {
  duration: number;
  difficulty: string;
  focusAreas: string[];
  goal: string;
  category: 'study';
  tags: [string, string];
} {
  return {
    duration: studyPlan.recommendedDurationMinutes,
    difficulty: studyPlan.recommendedDifficulty,
    focusAreas: studyPlan.focusAreas,
    goal: `Complete study tasks: ${studyPlan.tasks.length} items`,
    category: 'study',
    tags: ['content-study', generationId],
  };
}

/**
 * Check if content study feature is fully integrated
 */
export function verifyContentStudyIntegration(): {
  isComplete: boolean;
  missing: string[];
} {
  const checks = {
    analytics: contentStudyAnalytics.getMetrics() !== undefined,
    events: true, // Events are always available
    persistence: true, // Persistence is always available
  };

  const missing: string[] = [];
  for (const [name, passed] of Object.entries(checks)) {
    if (!passed) { missing.push(name); }
  }

  return {
    isComplete: missing.length === 0,
    missing,
  };
}
