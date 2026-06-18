import type { SessionHistoryEntry } from '../types';
import { parseSessionHistoryJson } from './SessionRepositoryParsers';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('session:repository:history');

export async function getSessionHistoryFromStorage(
  getString: (key: string) => Promise<string | null>,
  storageKey: string,
  limit: number,
): Promise<SessionHistoryEntry[]> {
  try {
    const data = await getString(storageKey);
    if (data) {return parseSessionHistoryJson(data, limit);}
  } catch (error) {
    debug.error(
      'Failed to load history',
      error instanceof Error ? error : new Error(String(error)),
    );
  }
  return [];
}

export async function getSessionByIdFromStorage(
  getString: (key: string) => Promise<string | null>,
  storageKey: string,
  sessionId: string,
): Promise<SessionHistoryEntry | null> {
  const history = await getSessionHistoryFromStorage(
    getString,
    storageKey,
    1000,
  );
  return history.find((e) => e.sessionId === sessionId) ?? null;
}

export async function addToHistoryInStorage(
  entry: SessionHistoryEntry,
  getString: (key: string) => Promise<string | null>,
  setString: (key: string, value: string) => Promise<void>,
  storageKey: string,
): Promise<void> {
  try {
    let history = await getSessionHistoryFromStorage(
      getString,
      storageKey,
      1000,
    );
    history.unshift(entry);
    if (history.length > 1000) {history = history.slice(0, 1000);}
    await setString(storageKey, JSON.stringify(history));
  } catch (error) {
    debug.error(
      'Failed to add to history',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}
