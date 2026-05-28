import { useEffect, useRef, useState } from "react";

export function useCountUp(
  end: number,
  duration: number = 1000,
  start: number = 0,
): number {
  const [value, setValue] = useState(start);
  const startTimeRef = useRef<number | null>(null);
  useEffect(() => {
    startTimeRef.current = null;
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;
      setValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);
  return value;
}

export function useCounterAnimation(
  target: number,
  options: { duration?: number; delay?: number; onComplete?: () => void } = {},
): number {
  const { duration = 800, delay = 0, onComplete } = options;
  const [value, setValue] = useState(0);
  const targetRef = useRef(target);
  useEffect(() => {
    targetRef.current = target;
    const startTimeout = setTimeout(() => {
      const startTime = Date.now();
      const startValue = value;
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(
          startValue + (targetRef.current - startValue) * easeProgress,
        );
        setValue(current);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onComplete?.();
        }
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [target, duration, delay, onComplete, value]);
  return value;
}
