/**
 * Progressive Onboarding System
 *
 * Phase 5.3 - Onboarding Refinement
 * Gets users to first session faster with progressive feature unlocks
 *
 * New Flow:
 * 1. Welcome (1 screen) - Value prop, "Let's get you focused"
 * 2. Quick Start (optional) - Skip to generic session, or customize
 * 3. First Session (core) - 15-min default, simple UI
 * 4. Post-Session - Celebration + "Want to set a goal?" (optional)
 * 5. Home Introduction - Explain recommendation engine
 * 6. AI Study Intro - Optional, after 3+ sessions
 *
 * Progressive Feature Unlock:
 * - Session 1-3: Basic focus only
 * - Session 4: Boss introduced
 * - Session 5: AI Study plans available
 * - Session 7: Squads unlocked
 * - Session 10: Advanced features visible
 *
 * Dependencies:
 * - Onboarding (existing)
 * - Sessions (first session tracking)
 * - Home (recommendation intro)
 * - Content Study (AI unlock)
 * - Squads (squad unlock)
 * - Boss (boss unlock)
 */

import { eventBus } from '../../events';

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Feature Unlock Gates
// ============================================================================
// ============================================================================
// Onboarding Flow State Management
// ============================================================================

const onboardingStates = new Map<string, OnboardingState>();

/**
 * Check and unlock features based on session count
 */
function checkFeatureUnlocks(state: OnboardingState): void {
  for (const gate of FEATURE_UNLOCK_GATES) {
    // Skip if already unlocked
    if (state.unlockedFeatures.some((f) => f.featureId === gate.featureId)) {
      continue;
    }

    // Check if requirements met
    if (state.sessionsCompleted >= gate.requiresSessions) {
      // Unlock feature
      const unlocked: UnlockedFeature = {
        featureId: gate.featureId,
        featureName: gate.featureName,
        unlockedAt: Date.now(),
        introduced: false,
      };

      state.unlockedFeatures.push(unlocked);

      // Update next unlock
      const nextIndex = FEATURE_UNLOCK_GATES.findIndex((g) => g.featureId === gate.featureId) + 1;
      state.nextFeatureUnlock = nextIndex < FEATURE_UNLOCK_GATES.length ? FEATURE_UNLOCK_GATES[nextIndex] : null;

      eventBus.publish('onboarding:feature_unlocked', {
        userId: state.userId,
        feature: gate.featureId,
        featureId: gate.featureId,
        timestamp: Date.now(),
      });
    }
  }
}

// ============================================================================
// Step Content
// ============================================================================
// ============================================================================
// Progress Tracking
// ============================================================================
// ============================================================================
// Should Show Onboarding Check
// ============================================================================
// ============================================================================
// Feature Availability
// ============================================================================
// ============================================================================
// Exports (types already exported above)
// ============================================================================
export * from "./ProgressiveOnboarding.types";
export * from "./ProgressiveOnboarding.part1";
export * from "./ProgressiveOnboarding.part2";
