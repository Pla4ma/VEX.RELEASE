import {
  buildContentStudyGate,
  buildLearningExecutionCopy,
  resolveLearningExecutionPersona,
} from '../service';

describe('learning execution service – persona and copy', () => {
  describe('adaptive naming: all five personae', () => {
    it('STUDY goal maps to simple Study label', () => {
      expect(resolveLearningExecutionPersona({ goal: 'STUDY' })).toBe(
        'student',
      );
      const copy = buildLearningExecutionCopy({ persona: 'student' });
      expect(copy.layerName).toBe('Study');
      expect(copy.homeTitle).toBe('Study');
      expect(copy.emptyCta).toBe('Start study session');
    });

    it('LEARNING goal → learning persona, Learning OS label', () => {
      expect(resolveLearningExecutionPersona({ goal: 'LEARNING' })).toBe(
        'learning',
      );
      const copy = buildLearningExecutionCopy({ persona: 'learning' });
      expect(copy.layerName).toBe('Learning OS');
      expect(copy.homeTitle).toBe('Learning OS');
    });

    it('WORK goal → work persona, Deep Work Plan label', () => {
      expect(resolveLearningExecutionPersona({ goal: 'WORK' })).toBe('work');
      const copy = buildLearningExecutionCopy({ persona: 'work' });
      expect(copy.layerName).toBe('Deep Work Plan');
      expect(copy.homeTitle).toBe('Deep Work Plan');
    });

    it('CREATIVE goal → creative persona, Project Focus Path label', () => {
      expect(resolveLearningExecutionPersona({ goal: 'CREATIVE' })).toBe(
        'creative',
      );
      const copy = buildLearningExecutionCopy({ persona: 'creative' });
      expect(copy.layerName).toBe('Project Focus Path');
      expect(copy.homeTitle).toBe('Project Focus Path');
    });

    it('PERSONAL goal → growth persona, Growth Path label', () => {
      expect(resolveLearningExecutionPersona({ goal: 'PERSONAL' })).toBe(
        'growth',
      );
      const copy = buildLearningExecutionCopy({ persona: 'growth' });
      expect(copy.layerName).toBe('Growth Path');
      expect(copy.homeTitle).toBe('Growth Path');
    });
  });

  describe('school-only copy does not leak to non-study users', () => {
    it('study user copy allows school wording', () => {
      const copy = buildLearningExecutionCopy({ persona: 'student' });
      expect(copy.layerName).toBe('Study');
    });

    it('work user copy has no quiz/homework/chapter references', () => {
      const copy = buildLearningExecutionCopy({ persona: 'work' });
      const joined = [
        copy.layerName,
        copy.homeTitle,
        copy.homeCta,
        copy.emptyTitle,
        copy.emptyCta,
        copy.setupCta,
        copy.setupEyebrow,
      ].join(' ');
      expect(joined.toLowerCase()).not.toMatch(/quiz|homework|chapter/);
    });

    it('creative user copy has no school wording', () => {
      const copy = buildLearningExecutionCopy({ persona: 'creative' });
      const joined = [copy.layerName, copy.homeTitle, copy.homeCta].join(' ');
      expect(joined.toLowerCase()).not.toMatch(
        /quiz|homework|chapter|study\s+os/i,
      );
    });

    it('growth user copy has no school wording', () => {
      const copy = buildLearningExecutionCopy({ persona: 'growth' });
      const joined = [copy.layerName, copy.homeTitle, copy.homeCta].join(' ');
      expect(joined.toLowerCase()).not.toMatch(
        /quiz|homework|chapter|study\s+os/i,
      );
    });

    it('learning user copy has no quiz/homework/chapter', () => {
      const copy = buildLearningExecutionCopy({ persona: 'learning' });
      const joined = [copy.layerName, copy.homeTitle, copy.homeCta].join(' ');
      expect(joined.toLowerCase()).not.toMatch(/quiz|homework|chapter/);
    });
  });

  describe('LEARNING goal content study gate', () => {
    it('delays content upload for LEARNING users on Day 0', () => {
      const gate = buildContentStudyGate({
        aiConfigured: true,
        featureHealth: 'healthy',
        goal: 'LEARNING',
        hasPrivacyDisclosure: true,
        rateLimitsConfigured: true,
        storageConfigured: true,
        totalCompletedSessions: 0,
      });

      expect(gate.showUploadEntry).toBe(false);
      expect(gate.fallback).toContain('study target');
    });
  });
});
