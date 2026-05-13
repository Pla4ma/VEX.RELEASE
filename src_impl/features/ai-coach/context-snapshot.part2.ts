import { z } from "zod";
import { createDebugger } from "../../utils/debug";


export function getContextHash(snapshot: ContextSnapshot): string {
  const key = `${snapshot.userId}:${snapshot.capturedAt}:${snapshot.streakContext.currentStreak}`;
  return `ctx-${Buffer.from(key).toString('base64').slice(0, 16)}`;
}