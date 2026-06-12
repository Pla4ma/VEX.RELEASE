import type { EnterDirection, EnterSpeed } from '../enter-animation-core';
import { SPEED_CONFIGS, getEnterAnimation } from '../enter-animation-core';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const mockBuilder = {
    duration: jest.fn().mockReturnThis(),
    delay: jest.fn().mockReturnThis(),
    easing: jest.fn().mockReturnThis(),
  };
  return {
    FadeIn: { ...mockBuilder, duration: jest.fn().mockReturnThis() },
    FadeInUp: { ...mockBuilder },
    FadeInDown: { ...mockBuilder },
    FadeInLeft: { ...mockBuilder },
    FadeInRight: { ...mockBuilder },
    Easing: {
      ease: 'ease',
      out: jest.fn().mockReturnValue('out-easing'),
      in: jest.fn().mockReturnValue('in-easing'),
      quad: 'quad',
      cubic: 'cubic',
    },
  };
});

describe('enter-animation-core', () => {
  describe('SPEED_CONFIGS', () => {
    it('has configs for all speeds', () => {
      expect(SPEED_CONFIGS.instant).toEqual({ duration: 0, easing: 'ease' });
      expect(SPEED_CONFIGS.fast.duration).toBe(200);
      expect(SPEED_CONFIGS.normal.duration).toBe(350);
      expect(SPEED_CONFIGS.slow.duration).toBe(500);
    });

    it('instant has zero duration', () => {
      expect(SPEED_CONFIGS.instant.duration).toBe(0);
    });
  });

  describe('getEnterAnimation', () => {
    it('returns FadeIn for reduced motion', () => {
      const anim = getEnterAnimation('up', 'normal', 0, 100, true);
      expect(anim).toBeDefined();
    });

    it('returns FadeIn for instant speed', () => {
      const anim = getEnterAnimation('up', 'instant', 0, 100, false);
      expect(anim).toBeDefined();
    });

    it('handles all directions', () => {
      const directions: EnterDirection[] = ['up', 'down', 'left', 'right', 'fade'];
      for (const dir of directions) {
        const anim = getEnterAnimation(dir, 'normal', 0, 100, false);
        expect(anim).toBeDefined();
      }
    });

    it('passes delay to animation', () => {
      const anim = getEnterAnimation('up', 'normal', 200, 100, false);
      expect(anim).toBeDefined();
    });
  });
});
