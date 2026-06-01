import { buildContentStudyTimeoutFallback } from '../service';
import { buildContentStudyVisibility } from '../content-study-visibility';

const healthyBase = {
  aiConfigured: true,
  canNavigate: true,
  canQuery: true,
  canRenderEntryPoint: true,
  canUseBackend: true,
  featureHealth: 'healthy' as const,
  hasPrivacyDisclosure: true,
  primaryGoal: 'STUDY',
  rateLimitsConfigured: true,
  storageConfigured: true,
  studyUsageRatio: 0,
};

describe('Day 0 study layers', () => {
  it('shows simple study session, not upload, on Day 0', () => {
    const visibility = buildContentStudyVisibility({
      ...healthyBase,
      motivationStyle: 'study_focused',
      totalCompletedSessions: 0,
    });

    expect(visibility.canShowTeaser).toBe(true);
    expect(visibility.canShowUploadEntry).toBe(false);
    expect(visibility.fallbackLabel).toContain('study target');
  });

  it('hides Study OS Day 0 from non-study users', () => {
    const visibility = buildContentStudyVisibility({
      ...healthyBase,
      motivationStyle: 'worker',
      primaryGoal: 'WORK',
      totalCompletedSessions: 0,
    });

    expect(visibility.canShowTeaser).toBe(false);
    expect(visibility.canShowUploadEntry).toBe(false);
  });

  it('degraded backend hides upload and keeps study-session fallback', () => {
    const visibility = buildContentStudyVisibility({
      ...healthyBase,
      featureHealth: 'degraded',
      motivationStyle: 'student',
      totalCompletedSessions: 5,
    });

    expect(visibility.canShowUploadEntry).toBe(false);
    expect(visibility.fallbackLabel).toContain('Start a study session');
  });

  it('60-second content timeout falls back to study session', () => {
    const fallback = buildContentStudyTimeoutFallback();

    expect(fallback.ctaLabel).toBe('Start study session');
    expect(fallback.body).toContain('retry content generation');
  });
});
