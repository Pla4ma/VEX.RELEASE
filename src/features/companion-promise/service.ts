import {
  CompletedSessionPromiseInputSchema,
  CompanionPromiseHomeStateSchema,
  CompanionPromiseLifecycleResultSchema,
} from "./schemas";
import {
  publishPromiseCreated,
  publishPromiseFulfilled,
  publishPromiseMissed,
  publishPromiseRecovered,
} from "./events";
import {
  trackPromiseCreated,
  trackPromiseFulfilled,
  trackPromiseMissed,
  trackPromiseRecovered,
} from "./analytics";
import {
  createPromise,
  dismissRecoveryPromise,
  fulfillPromise,
  getPendingPromise,
  getRecentPromises,
  markPromiseMissed,
  replacePromise,
} from "./repository";
import type {
  CompanionPromise,
  CompanionPromiseHomeState,
  CompanionPromiseLifecycleResult,
  CompletedSessionPromiseInput,
} from "./types";
import {
  toDateKey,
  isMatchOrBetter,
  buildNextPromiseInput,
  MinimumPromiseMinutes,
} from "./service-helpers";

async function markExpiredPromise(
  pendingPromise: CompanionPromise | null,
  today: string,
  nowIso: string,
): Promise<CompanionPromise | null> {
  if (!pendingPromise || pendingPromise.targetDate >= today) {
    return null;
  }
  const missedPromise = await markPromiseMissed(pendingPromise.id, nowIso);
  publishPromiseMissed(missedPromise);
  trackPromiseMissed(missedPromise);
  return missedPromise;
}

export async function processCompletedSessionPromise(
  input: CompletedSessionPromiseInput,
  timeZone: string,
): Promise<CompanionPromiseLifecycleResult> {
  const parsed = CompletedSessionPromiseInputSchema.parse(input);
  const nowIso = new Date(parsed.completedAt).toISOString();
  const today = toDateKey(parsed.completedAt, timeZone);
  const pendingPromise = await getPendingPromise(parsed.userId);
  const missedPromise = await markExpiredPromise(pendingPromise, today, nowIso);
  let activePendingPromise = missedPromise ? null : pendingPromise;
  let fulfilledPromise: CompanionPromise | null = null;

  if (
    activePendingPromise &&
    isMatchOrBetter(parsed, activePendingPromise, timeZone)
  ) {
    fulfilledPromise = await fulfillPromise(
      activePendingPromise.id,
      nowIso,
      parsed.sessionId,
    );
    publishPromiseFulfilled(fulfilledPromise);
    trackPromiseFulfilled(fulfilledPromise);
    activePendingPromise = null;
  }

  if (parsed.durationMinutes < MinimumPromiseMinutes) {
    return CompanionPromiseLifecycleResultSchema.parse({
      createdPromise: null,
      fulfilledPromise,
      missedPromise,
    });
  }

  if (
    activePendingPromise &&
    activePendingPromise.sourceSessionId !== parsed.sessionId
  ) {
    await replacePromise(activePendingPromise.id);
  }

  const createdPromise = await createPromise(
    buildNextPromiseInput(parsed, timeZone),
  );
  publishPromiseCreated(createdPromise);
  trackPromiseCreated(createdPromise);
  return CompanionPromiseLifecycleResultSchema.parse({
    createdPromise,
    fulfilledPromise,
    missedPromise,
  });
}

export async function getHomePromiseState(
  userId: string,
  isOnline: boolean,
  timeZone: string,
  now = Date.now(),
): Promise<CompanionPromiseHomeState> {
  const today = toDateKey(now, timeZone);
  const nowIso = new Date(now).toISOString();
  const pendingPromise = await getPendingPromise(userId);
  const resolvedMiss = await markExpiredPromise(pendingPromise, today, nowIso);
  if (resolvedMiss) {
    return CompanionPromiseHomeStateSchema.parse({
      kind: "missed",
      promise: resolvedMiss,
      showOfflineBanner: !isOnline,
    });
  }
  if (pendingPromise) {
    return CompanionPromiseHomeStateSchema.parse({
      kind: "pending",
      promise: pendingPromise,
      showOfflineBanner: !isOnline,
    });
  }
  const latestPromise = (await getRecentPromises(userId, 3))[0] ?? null;
  if (!latestPromise) {
    return CompanionPromiseHomeStateSchema.parse({
      kind: isOnline ? "hidden" : "offline",
      showOfflineBanner: !isOnline,
    });
  }
  if (latestPromise.status === "fulfilled") {
    return CompanionPromiseHomeStateSchema.parse({
      kind: "fulfilled",
      promise: latestPromise,
      showOfflineBanner: !isOnline,
    });
  }
  if (latestPromise.status === "missed") {
    return CompanionPromiseHomeStateSchema.parse({
      kind: "missed",
      promise: latestPromise,
      showOfflineBanner: !isOnline,
    });
  }
  return CompanionPromiseHomeStateSchema.parse({
    kind: isOnline ? "hidden" : "offline",
    showOfflineBanner: !isOnline,
  });
}

export async function keepPromise(
  promise: CompanionPromise,
): Promise<CompanionPromise> {
  const dismissed = await dismissRecoveryPromise(promise.id);
  publishPromiseRecovered(dismissed);
  trackPromiseRecovered(dismissed);
  return dismissed;
}

export async function dismissRecovery(
  promiseId: string,
): Promise<CompanionPromise> {
  return dismissRecoveryPromise(promiseId);
}
