import { useCallback, useEffect, useRef } from 'react';

type ResponseCallback = () => void;

export function useCoachResponseTimer(): (callback: ResponseCallback, delayMs: number) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback((callback: ResponseCallback, delayMs: number) => {
    if (!isMountedRef.current) {return;}
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (isMountedRef.current) {
        callback();
      }
    }, delayMs);
  }, []);
}
