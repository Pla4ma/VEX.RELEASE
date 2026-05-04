/**
 * Neuroplasticity Trainer Integration
 *
 * Integrates NPT with other systems:
 * - Session breaks (micro-interventions)
 * - Biofeedback (HRV integration)
 * - Progression system
 * - Notification system
 */

import { eventBus } from '../../events';
import { NeuroplasticityTrainer } from './NeuroplasticityTrainer';
import * as analytics from './analytics';

// ============================================================================
// SESSION BREAK INTEGRATION
// ============================================================================

/**
 * Initialize micro-interventions during session breaks
 */
export function initializeSessionBreakIntegration(): () => void {
  const unsubscribeBreakStart = eventBus.subscribe('session:break_started', async (event) => {
    const { userId, sessionId, breakDuration } = event;
    if (!userId) {return;}

    const trainer = new NeuroplasticityTrainer(userId);
    const profile = await trainer.getProfile();
    if (!profile) {return;}

    // Only trigger interventions on longer breaks
    if (breakDuration < 30000) {return;} // Minimum 30 seconds

    // Get recommended intervention for break time
    const intervention = await trainer.getRecommendedIntervention('BREAK_TIME');

    if (intervention) {
      // Publish event for UI to display
      eventBus.publish('NPT_INTERVENTION_AVAILABLE', {
        userId,
        sessionId,
        intervention,
        breakDuration,
      });

      analytics.trackInterventionTriggered(
        userId,
        intervention.id,
        intervention.domain,
        'BREAK_TIME'
      );
    }
  });

  const unsubscribeDistraction = eventBus.subscribe('session:distraction_detected', async (event) => {
    const { userId, sessionId, distractionType } = event;
    if (!userId) {return;}

    const trainer = new NeuroplasticityTrainer(userId);

    // Get impulse control intervention
    const intervention = await trainer.getRecommendedIntervention('DISTRACTION_DETECTED');

    if (intervention) {
      eventBus.publish('NPT_INTERVENTION_AVAILABLE', {
        userId,
        sessionId,
        intervention,
        trigger: 'distraction',
        distractionType,
      });

      analytics.trackInterventionTriggered(
        userId,
        intervention.id,
        intervention.domain,
        'DISTRACTION_DETECTED',
        'DISTRACTED'
      );
    }
  });

  const unsubscribeFrustration = eventBus.subscribe('session:frustration_detected', async (event) => {
    const { userId, sessionId, frustrationLevel } = event;
    if (!userId || frustrationLevel < 0.6) {return;}

    const trainer = new NeuroplasticityTrainer(userId);

    // Get emotional regulation intervention
    const intervention = await trainer.getRecommendedIntervention('FRUSTRATION');

    if (intervention) {
      eventBus.publish('NPT_INTERVENTION_AVAILABLE', {
        userId,
        sessionId,
        intervention,
        trigger: 'frustration',
        frustrationLevel,
      });

      analytics.trackInterventionTriggered(
        userId,
        intervention.id,
        intervention.domain,
        'FRUSTRATION',
        'FRUSTRATED'
      );
    }
  });

  return () => {
    unsubscribeBreakStart();
    unsubscribeDistraction();
    unsubscribeFrustration();
  };
}

// ============================================================================
// PROGRESSION INTEGRATION
// ============================================================================

/**
 * Get training bonuses based on cognitive level
 */
export function getTrainingBonuses(overallLevel: number): {
  xpMultiplier: number;
  coinBonus: number;
  gemBonus: number;
} {
  // Bonuses increase with overall level
  const tier = Math.floor(overallLevel / 100);

  return {
    xpMultiplier: 1 + tier * 0.1,        // +10% per tier
    coinBonus: tier * 50,                 // +50 coins per tier
    gemBonus: Math.floor(tier / 2) * 5,   // +5 gems every 2 tiers
  };
}

export function initializeProgressionIntegration(): () => void {
  const unsubscribe = eventBus.subscribe('TRAINING_SESSION_COMPLETED', (event) => {
    const { userId, domain, xpEarned, overallLevel } = event;

    // Calculate bonuses
    const bonuses = getTrainingBonuses(overallLevel);
    const totalXp = Math.round(xpEarned * bonuses.xpMultiplier);

    // Publish bonus event for progression system
    eventBus.publish('NPT_TRAINING_BONUS', {
      userId,
      domain,
      baseXp: xpEarned,
      totalXp,
      xpMultiplier: bonuses.xpMultiplier,
      coinBonus: bonuses.coinBonus,
      gemBonus: bonuses.gemBonus,
      overallLevel,
    });

    // Track engagement
    analytics.trackNptEngagement(userId, 'daily_training');
    analytics.trackTrainingConsistency(userId, 1, 7); // Simplified - would track actual weekly data
  });

  return unsubscribe;
}

// ============================================================================
// BIOFEEDBACK INTEGRATION
// ============================================================================

interface BiofeedbackData {
  hrv: number;           // Heart rate variability
  heartRate: number;     // BPM
  coherence: number;     // 0-1
  skinConductance?: number;
}

/**
 * Process biofeedback data and recommend interventions
 */
export async function processBiofeedback(
  userId: string,
  biofeedback: BiofeedbackData
): Promise<{
  needsIntervention: boolean;
  recommendedIntervention?: string;
  stressLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}> {
  const trainer = new NeuroplasticityTrainer(userId);

  // Determine stress level
  let stressLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

  if (biofeedback.hrv < 30 || biofeedback.coherence < 0.3) {
    stressLevel = 'HIGH';
  } else if (biofeedback.hrv < 50 || biofeedback.coherence < 0.6) {
    stressLevel = 'MEDIUM';
  }

  // Get intervention if stress is elevated
  if (stressLevel !== 'LOW') {
    const intervention = await trainer.getRecommendedIntervention(
      'LOW_FOCUS',
      stressLevel === 'HIGH' ? 'FRUSTRATED' : 'DISTRACTED',
      biofeedback
    );

    return {
      needsIntervention: true,
      recommendedIntervention: intervention?.id,
      stressLevel,
    };
  }

  return { needsIntervention: false, stressLevel };
}

/**
 * Subscribe to biofeedback events
 */
export function initializeBiofeedbackIntegration(): () => void {
  const unsubscribe = eventBus.subscribe('biofeedback:update', async (event) => {
    const { userId, sessionId, data } = event;

    const result = await processBiofeedback(userId, data);

    if (result.needsIntervention && result.recommendedIntervention) {
      eventBus.publish('NPT_BIOFEEDBACK_INTERVENTION', {
        userId,
        sessionId,
        interventionId: result.recommendedIntervention,
        stressLevel: result.stressLevel,
        biofeedback: data,
      });
    }
  });

  return unsubscribe;
}

// ============================================================================
// ONBOARDING INTEGRATION
// ============================================================================

export async function initializeForNewUser(
  userId: string,
  adhdSubtype: 'INATTENTIVE' | 'HYPERACTIVE' | 'COMBINED' | 'UNSPECIFIED'
): Promise<{ success: boolean; error?: string; recommendedSessionLength?: number }> {
  try {
    const trainer = new NeuroplasticityTrainer(userId);
    const profile = await trainer.initializeProfile(adhdSubtype);

    analytics.trackNptProfileCreated(
      userId,
      adhdSubtype,
      profile.priorityDomains,
      profile.overallLevel
    );
    analytics.trackNptFunnel(userId, 'profile_created');

    return {
      success: true,
      recommendedSessionLength: profile.recommendedSessionStructure.focusDurationMinutes,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    analytics.trackNptError(userId, 'onboarding_init_failed', errorMessage, {});
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// NOTIFICATION INTEGRATION
// ============================================================================

export async function checkTrainingReminderNeeded(userId: string): Promise<{
  shouldRemind: boolean;
  reason?: string;
  priorityDomain?: string;
}> {
  const trainer = new NeuroplasticityTrainer(userId);
  const profile = await trainer.getProfile();

  if (!profile) {
    return { shouldRemind: true, reason: 'no_profile' };
  }

  // Check last training date
  const allProgress = await trainer.getAllDomainProgress();
  const lastTrained = Object.values(allProgress)
    .filter(p => p.lastTrainedAt)
    .sort((a, b) => (b.lastTrainedAt || 0) - (a.lastTrainedAt || 0))[0];

  if (!lastTrained || !lastTrained.lastTrainedAt) {
    return { shouldRemind: true, reason: 'never_trained', priorityDomain: profile.priorityDomains[0] };
  }

  const daysSinceTraining = Math.floor((Date.now() - lastTrained.lastTrainedAt) / (1000 * 60 * 60 * 24));

  if (daysSinceTraining >= 2) {
    return {
      shouldRemind: true,
      reason: `${daysSinceTraining}_days_since_training`,
      priorityDomain: profile.priorityDomains[0],
    };
  }

  return { shouldRemind: false };
}

// ============================================================================
// COMPREHENSIVE INITIALIZATION
// ============================================================================

export function initializeNeuroplasticityIntegrations(): {
  cleanup: () => void;
} {
  const cleanupBreaks = initializeSessionBreakIntegration();
  const cleanupProgression = initializeProgressionIntegration();
  const cleanupBiofeedback = initializeBiofeedbackIntegration();

  return {
    cleanup: () => {
      cleanupBreaks();
      cleanupProgression();
      cleanupBiofeedback();
    },
  };
}
