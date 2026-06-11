/**
 * Today System — Extended Tests
 *
 * Extended edge case tests for buildTodaySystem.
 */

import { buildTodaySystem } from '../service';

describe('today system — extended', () => {
  describe('section visibility', () => {
    it('hides all sections when today_strip is hidden', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        hiddenFeatureKeys: ['today_strip'],
      });
      for (const section of system.sections) {
        expect(section.visible).toBe(false);
      }
    });

    it('shows now section by default', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
      });
      const nowSection = system.sections.find((s) => s.key === 'now');
      expect(nowSection?.visible).toBe(true);
    });

    it('shows done section by default', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
      });
      const doneSection = system.sections.find((s) => s.key === 'done');
      expect(doneSection?.visible).toBe(true);
    });

    it('hides later section when laterAction is null', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        laterAction: null,
      });
      const laterSection = system.sections.find((s) => s.key === 'later');
      expect(laterSection?.visible).toBe(false);
    });

    it('shows later section when laterAction is provided', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        laterAction: {
          id: 'later-1',
          label: 'Review notes',
          ctaLabel: 'Start review',
          durationSeconds: 600,
        },
      });
      const laterSection = system.sections.find((s) => s.key === 'later');
      expect(laterSection?.visible).toBe(true);
    });

    it('hides recovery section when dayFeelsMessy is false', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        dayFeelsMessy: false,
      });
      const recoverySection = system.sections.find((s) => s.key === 'recovery');
      expect(recoverySection?.visible).toBe(false);
    });

    it('shows recovery section when dayFeelsMessy is true', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        dayFeelsMessy: true,
      });
      const recoverySection = system.sections.find((s) => s.key === 'recovery');
      expect(recoverySection?.visible).toBe(true);
    });
  });

  describe('animation level', () => {
    it('uses subtle animation for minimal_normal without reduced motion', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        reducedMotion: false,
      });
      expect(system.animationLevel).toBe('subtle');
    });

    it('uses no animation when reduced motion is enabled', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        reducedMotion: true,
      });
      expect(system.animationLevel).toBe('none');
    });

    it('uses no animation for non-minimal lanes', () => {
      const system = buildTodaySystem({
        lane: 'game_like',
        reducedMotion: false,
      });
      expect(system.animationLevel).toBe('none');
    });
  });

  describe('done section content', () => {
    it('shows singular block text for 1 completion', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        completedToday: 1,
      });
      const doneSection = system.sections.find((s) => s.key === 'done');
      expect(doneSection?.body).toContain('1 clean block');
      expect(doneSection?.body).not.toContain('blocks');
    });

    it('shows plural blocks text for multiple completions', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        completedToday: 3,
      });
      const doneSection = system.sections.find((s) => s.key === 'done');
      expect(doneSection?.body).toContain('3 clean blocks');
    });

    it('shows encouragement text for 0 completions', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        completedToday: 0,
      });
      const doneSection = system.sections.find((s) => s.key === 'done');
      expect(doneSection?.body).toContain('Nothing banked yet');
    });
  });

  describe('now action', () => {
    it('uses default now action when none provided', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
      });
      const nowSection = system.sections.find((s) => s.key === 'now');
      expect(nowSection?.body).toBe(
        'Name one task. Run the block. That is enough.',
      );
      expect(nowSection?.ctaLabel).toBe('Start clean block');
      expect(nowSection?.durationSeconds).toBe(25 * 60);
    });

    it('uses custom now action when provided', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        nowAction: {
          id: 'custom-now',
          label: 'Custom now action',
          ctaLabel: 'Custom CTA',
          durationSeconds: 1200,
        },
      });
      const nowSection = system.sections.find((s) => s.key === 'now');
      expect(nowSection?.body).toBe('Custom now action');
      expect(nowSection?.ctaLabel).toBe('Custom CTA');
      expect(nowSection?.durationSeconds).toBe(1200);
    });
  });

  describe('recovery action', () => {
    it('recovery has 5 minute duration', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        dayFeelsMessy: true,
      });
      const recoverySection = system.sections.find((s) => s.key === 'recovery');
      expect(recoverySection?.durationSeconds).toBe(5 * 60);
    });

    it('recovery has correct labels', () => {
      const system = buildTodaySystem({
        lane: 'minimal_normal',
        dayFeelsMessy: true,
      });
      const recoverySection = system.sections.find((s) => s.key === 'recovery');
      expect(recoverySection?.title).toBe('Recovery');
      expect(recoverySection?.ctaLabel).toBe('Recover');
    });
  });
});
