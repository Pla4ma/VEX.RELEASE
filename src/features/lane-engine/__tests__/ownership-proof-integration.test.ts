import { decideHomeSurfaces } from '../../home-experience/home-surface-decision';
import { resolvePersonalizedPremium } from '../../monetization/personalized-premium';
import { decideNudge } from '../../notification-policy/service';
import { createRescuePlan } from '../../rescue-mode/service';
import { buildCompletionPersonalizationResult } from '../../session-completion/completion-personalization';
import { buildCoachPresence } from '../../coach-presence/service';
import { buildLaneSessionBrief } from '../../session-start/service';
import { resolveActiveSessionDisplayPolicy } from '../../../screens/session/utils/active-session-display-policy';
import { SessionMode } from '../../../session/modes';
import { getLaneMechanicPolicy } from '../service';
import {
  profile,
  summary,
  available,
} from './ownership-proof-helpers';

describe('Lane Engine ownership proof – consumer integration', () => {
  it('core consumers prefer LaneProfile over conflicting legacy signals', () => {
    const student = profile('student');
    const run = profile('game_like');
    const project = profile('deep_creative');

    const home = decideHomeSurfaces({
      behaviorStats: {
        bossChallengeEngagement: 'high',
        coachInteractions: 0,
        comebackSessions: 0,
        completionStreak: 0,
        ignoredFeatures: [],
        premiumFeatureAttempts: [],
        studyUsageRatio: 0,
        totalCompletedSessions: 3,
      },
      featureAvailability: {
        boss: true,
        challenges: true,
        premium: true,
        study: true,
      },
      hasActiveBoss: true,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: true,
      isFirstSession: false,
      laneProfile: student,
      personalizationProfile: {
        gamificationIntensity: 'strong',
        motivationStyle: 'game_like',
        primaryGoal: 'work',
        studyLayerName: 'Study',
        userStage: 'engaged',
      },
    });
    expect(home.study_os).not.toBe('hidden');

    expect(
      buildLaneSessionBrief({ lane: 'minimal_normal', laneProfile: run })
        .sessionMode,
    ).toBe('SPRINT');
    expect(
      decideNudge({
        completedSessions: 4,
        context: 'run_open',
        daysSinceOnboarding: 3,
        lane: 'minimal_normal',
        laneProfile: run,
      }).type,
    ).toBe('run_continue');
    expect(
      createRescuePlan({
        lane: 'minimal_normal',
        laneProfile: project,
        reason: 'unclear',
        userId: 'u1',
      }).sessionMode,
    ).toBe('CREATIVE');
  });

  it('completion, coach, premium, and active session consume LaneProfile', () => {
    const student = profile('student');
    const completion = buildCompletionPersonalizationResult({
      focusScoreDelta: 1,
      grade: 'A',
      isPersonalBest: false,
      lane: 'game_like',
      laneProfile: student,
      streakAction: 'extended',
      streakDays: 1,
      summary: summary({ finalScore: 90 }),
      xpDelta: 10,
    });
    expect(completion.laneProfile.primaryLane).toBe('student');
    expect(completion.userFacingSummary.displayTitle).toContain('Clean work');

    const coach = buildCoachPresence({
      companion: null,
      featureAvailability: {
        focus: available(),
        progress: available(),
        study: available(),
      },
      laneProfile: student,
      memorySummary: {
        coachMemoryCount: 0,
        companionMemoryCount: 0,
        latestMemory: null,
        syncAvailable: true,
      },
      motivationStyle: 'CALM',
      progress: { currentStreakDays: 0, highFocusStreak: 0, totalSessions: 1 },
      surface: 'HOME',
    });
    expect(coach.nextAction.intent).toBe('START_STUDY_SESSION');

    const premium = resolvePersonalizedPremium({
      billingConfigured: true,
      completedSessions: 50,
      currentStreakDays: 0,
      daysSinceOnboarding: 10,
      hasTriedAdvancedStudy: false,
      hasTriedVisualIdentity: false,
      hasTriedWeeklyReport: false,
      lane: 'game_like',
      laneProfile: profile('deep_creative'),
      motivationStyle: 'game_like',
      primaryGoal: 'work',
      studyUsageRatio: 0,
    });
    expect(premium.premiumHeadline.toLowerCase()).toContain('project');

    const active = resolveActiveSessionDisplayPolicy({
      bossIntensity: 'visible',
      focusStage: 'active',
      laneProfile: profile('game_like'),
      motivationStyle: 'calm',
      primaryGoal: 'personal',
      sessionMode: SessionMode.LIGHT_FOCUS,
      studyLayerLabel: null,
    });
    expect(active.showBossTinyIndicator).toBe(true);
  });

  it('lane policy describes mechanics but cannot unlock hidden features directly', () => {
    const policy = getLaneMechanicPolicy(profile('game_like'));
    expect(policy.preferredMechanics).toContain('focus_run');
    expect('canRender' in policy).toBe(false);
    expect('canRoute' in policy).toBe(false);
    expect('canQuery' in policy).toBe(false);
  });
});
