import type { TransitionConfig, TransitionPreset, TransitionEasing } from '../transition-config';

describe('transition-config types', () => {
  it('TransitionPreset accepts all preset values', () => {
    const presets: TransitionPreset[] = [
      'fade', 'slideRight', 'slideLeft', 'slideUp', 'slideDown',
      'zoom', 'flip', 'scale', 'none',
    ];
    for (const preset of presets) {
      const config: TransitionConfig = { preset };
      expect(config.preset).toBe(preset);
    }
  });

  it('TransitionConfig accepts all fields', () => {
    const config: TransitionConfig = {
      preset: 'fade',
      duration: 500,
      delay: 100,
      easing: 'spring',
      springConfig: { damping: 10, stiffness: 100, mass: 1, overshootClamping: true },
    };
    expect(config.duration).toBe(500);
    expect(config.delay).toBe(100);
    expect(config.easing).toBe('spring');
    expect(config.springConfig!.damping).toBe(10);
  });

  it('TransitionConfig allows minimal config', () => {
    const config: TransitionConfig = { preset: 'none' };
    expect(config.duration).toBeUndefined();
    expect(config.delay).toBeUndefined();
    expect(config.easing).toBeUndefined();
    expect(config.springConfig).toBeUndefined();
  });

  it('TransitionEasing accepts all easing values', () => {
    const easings: TransitionEasing[] = [
      'linear', 'ease', 'easeIn', 'easeOut', 'easeInOut', 'spring', 'bounce',
    ];
    for (const easing of easings) {
      const config: TransitionConfig = { preset: 'fade', easing };
      expect(config.easing).toBe(easing);
    }
  });
});
