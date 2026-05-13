import { useCallback } from 'react';

export function useStartSessionFlow() {
  const start = useCallback(async () => {
    return true;
  }, []);
  return { start };
}
