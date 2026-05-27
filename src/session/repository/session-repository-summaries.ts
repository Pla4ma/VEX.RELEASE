import type { SessionSummary } from "../types";
import { createDebugger } from "../../utils/debug";
import { parseSessionSummaryMapJson } from "./SessionRepositoryParsers";

const debug = createDebugger("session:repository");

type StorageGetter = (key: string) => Promise<string | null>;
type StorageSetter = (key: string, value: string) => Promise<void>;

export async function getSessionSummary(
  sessionId: string,
  userId: string,
  getString: StorageGetter,
  storageKey: string,
): Promise<SessionSummary | null> {
  try {
    const data = await getString(storageKey);
    if (data) {
      const summaries = parseSessionSummaryMapJson(data);
      return summaries[sessionId] || null;
    }
  } catch (error) {
    debug.error(
      "Failed to load summary",
      error instanceof Error ? error : new Error(String(error)),
    );
  }
  return null;
}

export async function saveSessionSummary(
  summary: SessionSummary,
  getString: StorageGetter,
  setString: StorageSetter,
  storageKey: string,
): Promise<void> {
  try {
    const data = await getString(storageKey);
    const summaries: Record<string, SessionSummary> = data
      ? parseSessionSummaryMapJson(data)
      : {};
    summaries[summary.sessionId] = summary;
    await setString(storageKey, JSON.stringify(summaries));
  } catch (error) {
    debug.error(
      "Failed to save summary",
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}

export async function getAllSummaries(
  getString: StorageGetter,
  storageKey: string,
): Promise<SessionSummary[]> {
  try {
    const data = await getString(storageKey);
    if (data) return Object.values(parseSessionSummaryMapJson(data));
  } catch (error) {
    debug.error(
      "Failed to load summaries",
      error instanceof Error ? error : new Error(String(error)),
    );
  }
  return [];
}
