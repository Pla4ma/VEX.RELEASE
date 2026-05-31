import { buildContentStudyVisibility } from '../content-study-visibility';
import type { ContentStudyVisibility } from '../content-study-visibility';

function baseInput() {
  return {
    motivationStyle: null as string | null,
    primaryGoal: null as string | null,
    totalCompletedSessions: 0,
    studyUsageRatio: 0,
    featureHealth: 'healthy' as const,
    aiConfigured: true,
    hasPrivacyDisclosure: true,
    rateLimitsConfigured: true,
    storageConfigured: true,
    canRenderEntryPoint: true,
    canNavigate: true,
    canQuery: true,
    canUseBackend: true,
  };
}

describe('ContentStudyVisibility', () => {
  describe('student user', () => {
    it('sees simple study session, not upload, on Day 0', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'study_focused',
        primaryGoal: 'STUDY',
      });

      expect(result.canShowTeaser).toBe(true);
      expect(result.canShowUploadEntry).toBe(false);
      expect(result.canNavigateToUpload).toBe(false);
      expect(result.fallbackLabel).toContain('study target');
    });

    it('sees content study when engaged', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'study_focused',
        primaryGoal: 'study',
        totalCompletedSessions: 3,
        studyUsageRatio: 0.8,
      });

      expect(result.canShowUploadEntry).toBe(true);
      expect(result.canRunBackend).toBe(true);
    });
  });

  describe('work user', () => {
    it('does not see upload on Day 0', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'coach_led',
        primaryGoal: 'WORK',
      });

      expect(result.canShowUploadEntry).toBe(false);
      expect(result.canShowTeaser).toBe(false);
      expect(result.fallbackLabel).toBe('Attach a target to your session');
    });

    it('stays on deep work path after sessions', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'coach_led',
        primaryGoal: 'WORK',
        totalCompletedSessions: 4,
      });

      expect(result.canShowTeaser).toBe(false);
      expect(result.canShowUploadEntry).toBe(false);
      expect(result.fallbackLabel).toBe('Build a deep work path');
    });
  });

  describe('learning user', () => {
    it('sees Study Session before Content Study unlock', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'study_focused',
        primaryGoal: 'LEARNING',
        totalCompletedSessions: 1,
      });

      expect(result.canShowTeaser).toBe(true);
      expect(result.canShowUploadEntry).toBe(false);
    });
  });

  describe('degraded content study', () => {
    it('cannot show upload CTA when degraded', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'study_focused',
        primaryGoal: 'STUDY',
        totalCompletedSessions: 5,
        featureHealth: 'degraded',
      });

      expect(result.canShowUploadEntry).toBe(false);
      expect(result.canRunBackend).toBe(false);
      expect(result.fallbackLabel).toContain('Start a study session');
    });

    it('allows normal session via fallback', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'study_focused',
        primaryGoal: 'STUDY',
        featureHealth: 'degraded',
      });

      expect(result.fallbackLabel).toContain('Start a study session');
    });
  });

  describe('unavailable content study', () => {
    it('blocks all entry points when unavailable', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'study_focused',
        primaryGoal: 'STUDY',
        totalCompletedSessions: 10,
        featureHealth: 'unavailable',
      });

      expect(result.canShowTeaser).toBe(false);
      expect(result.canShowUploadEntry).toBe(false);
      expect(result.canNavigateToUpload).toBe(false);
      expect(result.canRunBackend).toBe(false);
    });
  });

  describe('feature availability gate', () => {
    it('hides all content study when canRenderEntryPoint is false', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'study_focused',
        primaryGoal: 'STUDY',
        totalCompletedSessions: 10,
        canRenderEntryPoint: false,
      });

      expect(result.canShowTeaser).toBe(false);
      expect(result.canShowUploadEntry).toBe(false);
      expect(result.canNavigateToUpload).toBe(false);
      expect(result.canRunBackend).toBe(false);
    });

    it('allows teaser but not navigation when canNavigate is false', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'study_focused',
        primaryGoal: 'STUDY',
        totalCompletedSessions: 5,
        canNavigate: false,
      });

      expect(result.canShowTeaser).toBe(true);
      expect(result.canShowUploadEntry).toBe(false);
      expect(result.canNavigateToUpload).toBe(false);
    });

    it('blocks backend when canQuery or canUseBackend is false', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'study_focused',
        primaryGoal: 'STUDY',
        totalCompletedSessions: 5,
        canQuery: false,
        canUseBackend: false,
      });

      expect(result.canRunBackend).toBe(false);
      expect(result.canShowUploadEntry).toBe(false);
    });
  });

  describe('high study intent via usage ratio', () => {
    it('allows content study when studyUsageRatio >= 0.35 even without study goal', () => {
      const result = buildContentStudyVisibility({
        ...baseInput(),
        motivationStyle: 'game_like',
        primaryGoal: 'WORK',
        totalCompletedSessions: 5,
        studyUsageRatio: 0.4,
      });

      expect(result.canShowUploadEntry).toBe(true);
    });
  });
});
