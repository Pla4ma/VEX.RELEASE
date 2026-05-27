/**
 * @deprecated Use useReanimated.ts directly.
 */
export {
  useReanimated as useAnimation,
  useFadeIn,
  useSlideIn,
  usePressAnimation,
  useCountUp,
} from "./useReanimated";

export function useStaggeredAnimation(itemCount: number): number[] {
  return Array.from({ length: itemCount }, (_, index) => index);
}
