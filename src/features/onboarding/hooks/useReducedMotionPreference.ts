import { useReducedMotion } from 'react-native-reanimated';

export function useReducedMotionPreference(): boolean {
  return useReducedMotion();
}
