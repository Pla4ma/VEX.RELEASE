import { useCallback, useState } from 'react';
import { createRuntimeMMKV } from './mmkv-runtime';

type NumberUpdater = number | undefined | ((value: number | undefined) => number);

const storage = createRuntimeMMKV({ id: 'vex-hook-storage' });

export function useRuntimeMMKVNumber(
  key: string,
): [number | undefined, (value: NumberUpdater) => void] {
  const [storedValue, setStoredValue] = useState<number | undefined>(() =>
    storage.getNumber(key),
  );

  const setValue = useCallback(
    (value: NumberUpdater): void => {
      setStoredValue((current) => {
        const next = typeof value === 'function' ? value(current) : value;

        if (next === undefined) {
          storage.delete(key);
        } else {
          storage.set(key, next);
        }

        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
