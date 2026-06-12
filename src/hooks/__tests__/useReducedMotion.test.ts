import { renderHook } from '@testing-library/react-native';
import { useReducedMotion, useShouldAnimate } from '../useReducedMotion';

describe('useReducedMotion', () => {
  it('returns reduced motion configuration', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current.isReducedMotion).toBe(true);
    expect(result.current.animationConfig.duration).toBe(0);
    expect(result.current.animationConfig.skipAnimations).toBe(true);
    expect(result.current.staggerDelay).toBe(0);
  });

  it('returns stiff spring config for reduced motion', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current.springConfig.damping).toBe(50);
    expect(result.current.springConfig.stiffness).toBe(500);
    expect(result.current.springConfig.overshootClamping).toBe(true);
  });
});

describe('useShouldAnimate', () => {
  it('returns false when reduced motion is enabled', () => {
    const { result } = renderHook(() => useShouldAnimate());
    expect(result.current).toBe(false);
  });
});
