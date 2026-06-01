import { buildHomeExperienceModel } from '../service';
import { decideHomeSurfaces } from '../home-surface-decision';
import {
  featureAvailability,
  studyProfile,
  baseStats,
} from './product-journey-helpers';

describe('product journey — Day 0 study user', () => {
  it('Study OS surfaces softly as tiny_tease not spotlight', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe('tiny_tease');
    expect(surfaces.study_layer).not.toBe('spotlight');
  });

  it('first session is still primary', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.start_session).toBe('primary');
  });

  it('no full boss route for study user on Day 0', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'study_focused',
      totalCompletedSessions: 0,
    });
    expect(model.mustNotRun).toContain('boss_query');
  });

  it('does not expose ContentStudy route on Day 0', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'study_focused',
      totalCompletedSessions: 0,
    });
    const hasContentStudyRoute = model.allowedRoutes.some(
      (r) =>
        r.toLowerCase().includes('content') ||
        r.toLowerCase().includes('study'),
    );
    expect(hasContentStudyRoute).toBe(false);
    expect(model.mustNotRun).toContain('study_plan_query');
  });

  it('does not expose upload CTA on Day 0', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'study_focused',
      totalCompletedSessions: 0,
    });
    expect(model.studyOsPlacement).not.toContain('upload');
    expect(model.studyOsPlacement).not.toContain('PDF');
    expect(model.studyOsPlacement).not.toContain('YouTube');
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe('tiny_tease');
    expect(surfaces.study_layer).not.toBe('secondary');
    expect(surfaces.study_layer).not.toBe('primary');
  });
});
