/**
 * Live Focusing Widget — utility functions and hooks
 */
import { useState, useEffect } from "react";

/**
 * Animated count-up hook with ease-out cubic easing.
 */
export function useCountUp(target: number, duration: number = 1000): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const startTime = Date.now();
    const startValue = count;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (target - startValue) * easeOut);
      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [count, target, duration]);
  return count;
}

/**
 * Formats a number with K/M suffixes for display.
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}
