import React from 'react';
import { persistence, type PersistenceConfig } from './PersistenceService';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('persistence:usePersistence');

export function usePersistence<T>(config: PersistenceConfig<T>): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  save: (newData: T) => Promise<boolean>;
  refresh: () => Promise<T | null>;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        setLoading(true);
        const result = await persistence.get(config);
        setData(result);
        setError(null);
      } catch (err) {
        debug.error('usePersistence load error:', err as Error);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [config]);

  const save = React.useCallback(
    async (newData: T): Promise<boolean> => {
      try {
        await persistence.set(config, newData);
        setData(newData);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Save failed'));
        return false;
      }
    },
    [config],
  );

  return { data, loading, error, save, refresh: () => persistence.get(config) };
}
