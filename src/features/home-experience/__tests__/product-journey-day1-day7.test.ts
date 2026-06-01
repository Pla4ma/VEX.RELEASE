import { buildHomeExperienceModel, getHomeStage } from '../service';
import {
  decideHomeSurfaces,
  getSpotlightSurface,
} from '../home-surface-decision';
import {
  featureAvailability,
  calmProfile,
  studyProfile,
  gameLikeProfile,
  baseStats,
} from './product-journey-helpers';

describe('product journey — Day 1 return', () => {
  const model = buildHomeExperienceModel({
    explicitMotivationStyle: null,
    totalCompletedSessions: 1,
  });

  it('shows progress proof', () => {
    expect(model.visibleSections).toContain('progress_signal');
    expect(model.progressPlacement).not.toContain('Hidden');
    expect(model.visibleSections).toContain('session_reflection');
  });

  it('shows coach reflection', () => {
    expect(model.visibleSections).toContain('coach_line');
    expect(model.secondaryCta).toBe('Review progress');
  });

  it('next session CTA is primary', () => {
    expect(model.primaryCta).toBe('Start Next Session');
    expect(model.stage).toBe('STAGE_1');
  });

  it('progress signal appears on surfaces', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: { ...baseStats(1), completionStreak: 1 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.progress_proof).toBe('secondary');
  });
});

describe('product journey — Day 3 companion continuity', () => {
  it('companion thread visible for friendly style', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: {
        ...studyProfile,
        motivationStyle: 'friendly',
        primaryGoal: 'creative',
      },
      behaviorStats: {
        ...baseStats(3),
        coachInteractions: 2,
        completionStreak: 2,
      },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.companion_thread).not.toBe('hidden');
  });

  it('stage transitions correctly', () => {
    expect(getHomeStage(3)).toBe('STAGE_2');
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: null,
      totalCompletedSessions: 3,
    });
    expect(model.stage).toBe('STAGE_2');
  });
});

describe('product journey — Day 5 path forming', () => {
  it('study user gets study spotlight on Day 5', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(5), studyUsageRatio: 0.6 },
      hasActiveStudyPlan: true,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(getSpotlightSurface(surfaces)).toBe('study_layer');
  });

  it('no feature museum — at most limited visible surfaces', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: { ...baseStats(5), completionStreak: 3 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    const { visibleNonHidden } = require('./product-journey-helpers');
    const visible = visibleNonHidden(surfaces);
    expect(visible.length).toBeLessThan(8);
    expect(visible.every((v: string) => !v.includes('boss_full_cta'))).toBe(
      true,
    );
  });

  it('unlock strip visible for new user (1-2 sessions)', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(1), studyUsageRatio: 0.4 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.unlock_strip).toBe('secondary');
  });
});

describe('product journey — Day 7 deeper mode / weekly insight', () => {
  it('game-like user with high boss engagement gets boss spotlight', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(7), bossChallengeEngagement: 'high' },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: true,
      isFirstSession: false,
    });
    const spot = getSpotlightSurface(surfaces);
    expect(['boss_compact', 'boss_teaser'].includes(spot ?? '')).toBe(true);
  });

  it('premium only if real', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: {
        ...baseStats(7),
        premiumFeatureAttempts: [],
        studyUsageRatio: 0.3,
      },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.premium_tease).toBe('hidden');
  });

  it('weekly insight surfaced for engaged user', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'coach_led',
      totalCompletedSessions: 7,
    });
    expect(model.stage).toBe('STAGE_3');
    expect(model.spotlight).toBe('coach');
  });
});
