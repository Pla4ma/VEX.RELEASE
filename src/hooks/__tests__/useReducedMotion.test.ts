import { useReducedMotion, useShouldAnimate } from '../useReducedMotion';

describe('useReducedMotion', () => {
  it('returns reduced motion configuration', () => {
    const result = useReducedMotion();
    expect(result.isReducedMotion).toBe(true);
    expect(result.animationConfig.duration).toBe(0);
    expect(result.animationConfig.skipAnimations).toBe(true);
    expect(result.staggerDelay).toBe(0);
  });

  it('returns stiff spring config for reduced motion', () => {
    const result = useReducedMotion();
    expect(result.springConfig.damping).toBe(50);
    expect(result.springConfig.stiffness).toBe(500);
    expect(result.springConfig.overshootClamping).toBe(true);
  });
});

describe('useShouldAnimate', () => {
  it('returns false when reduced motion is enabled', () => {
    const result = useShouldAnimate();
    expect(result).toBe(false);
  });
});
