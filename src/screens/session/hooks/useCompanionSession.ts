import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '../../../shared/ui/components/Toast';
import type { SessionSummary } from '../../../session/types';
import { triggerHaptic } from '../../../utils/haptics';
import {
  getCompanionService,
  type CompanionService,
} from '../../../features/companion/service';
import type { CompanionState } from '../../../features/companion/types';
import { loadCompanionState } from '../../../features/companion/session-storage';
import type { UseCompanionSessionInput, UseCompanionSessionResult } from './useCompanionSessionTypes';
import { MILESTONES, getMilestoneLabel, getMilestoneHaptic } from './milestoneHelpers';
import { completeCompanionSessionImpl } from './completionHelper';

export type { UseCompanionSessionInput, UseCompanionSessionResult };
export function useCompanionSession(
  input: UseCompanionSessionInput,
): UseCompanionSessionResult {
  const {
    currentMode,
    elapsedSeconds,
    isPaused,
    purityScore,
    sessionId,
    totalSeconds,
    userId,
  } = input;
  const { show } = useToast();
  const serviceRef = useRef<CompanionService | null>(null);
  const showRef = useRef(show);
  const activeSessionRef = useRef<string | null>(null);
  const triggeredMilestonesRef = useRef<Set<number>>(new Set());
  const dangerActiveRef = useRef(false);
  const pureFocusStartedAtRef = useRef<number | null>(null);
  const pureBurstTriggeredRef = useRef(false);
  const [state, setState] = useState<CompanionState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [eventLabel, setEventLabel] = useState<string | null>(null);
  const hasCompanionState = state !== null;
  const sessionProgress = Math.round(
    (elapsedSeconds / Math.max(totalSeconds, 1)) * 100,
  );
  showRef.current = show;
  const flashEvent = useCallback((label: string): void => {
    setEventLabel(label);
    setTimeout(() => setEventLabel(null), 1400);
  }, []);
  useEffect(() => {
    if (!userId) {
      setState(null);
      setIsLoaded(true);
      return;
    }
    let mounted = true;
    setIsLoaded(false);
    loadCompanionState(userId)
      .then((loaded) => {
        if (!mounted) {
          return;
        }
        serviceRef.current = getCompanionService(loaded);
        setState(loaded);
      })
      .finally(() => {
        if (mounted) {
          setIsLoaded(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, [userId]);
  useEffect(() => {
    if (
      !serviceRef.current ||
      !hasCompanionState ||
      activeSessionRef.current === sessionId
    ) {
      return;
    }
    serviceRef.current.startSession(totalSeconds / 60);
    activeSessionRef.current = sessionId;
    triggeredMilestonesRef.current = new Set();
    dangerActiveRef.current = false;
    pureFocusStartedAtRef.current = null;
    pureBurstTriggeredRef.current = false;
    setState((current) =>
      current
        ? {
            ...current,
            currentMood: 'SLEEPY',
            sessionProgress: 0,
            updatedAt: Date.now(),
          }
        : current,
    );
  }, [hasCompanionState, sessionId, totalSeconds]);
  useEffect(() => {
    const service = serviceRef.current;
    if (!service || !hasCompanionState) {
      return;
    }
    service.tick(elapsedSeconds, totalSeconds, purityScore, isPaused);
    const nextState = service.getState();
    if (nextState) {
      setState({ ...nextState, sessionProgress });
    }
    for (const milestone of MILESTONES) {
      if (
        sessionProgress >= milestone &&
        !triggeredMilestonesRef.current.has(milestone)
      ) {
        triggeredMilestonesRef.current.add(milestone);
        const label = getMilestoneLabel(milestone, currentMode);
        flashEvent(label);
        triggerHaptic(getMilestoneHaptic(milestone));
      }
    }
    if (purityScore < 60 && !dangerActiveRef.current) {
      dangerActiveRef.current = true;
      flashEvent('Struggling');
      showRef.current({
        type: 'warning',
        title: 'Struggling',
        duration: 1400,
        priority: 'normal',
      });
      setState((current) =>
        current
          ? { ...current, currentMood: 'STRUGGLING', updatedAt: Date.now() }
          : current,
      );
      triggerHaptic('warning');
    }
    if (purityScore >= 60) {
      dangerActiveRef.current = false;
    }
    if (purityScore > 90 && !isPaused) {
      pureFocusStartedAtRef.current ??= elapsedSeconds;
      const pureSeconds = elapsedSeconds - pureFocusStartedAtRef.current;
      if (pureSeconds >= 300 && !pureBurstTriggeredRef.current) {
        pureBurstTriggeredRef.current = true;
        flashEvent('On fire!');
        showRef.current({
          type: 'success',
          title: 'On fire!',
          duration: 1400,
          priority: 'normal',
        });
        setState((current) =>
          current
            ? { ...current, currentMood: 'ECSTATIC', updatedAt: Date.now() }
            : current,
        );
        triggerHaptic('success');
      }
      return;
    }
    pureFocusStartedAtRef.current = null;
    pureBurstTriggeredRef.current = false;
  }, [
    currentMode,
    elapsedSeconds,
    flashEvent,
    hasCompanionState,
    isPaused,
    purityScore,
    sessionProgress,
    totalSeconds,
  ]);
  const completeCompanionSession = useCallback(
    async (summary: SessionSummary): Promise<void> => {
      const saved = await completeCompanionSessionImpl(
        serviceRef.current,
        state,
        userId,
        sessionId,
        summary,
      );
      if (saved) {
        setState(saved);
      }
    },
    [sessionId, state, userId],
  );
  return {
    completeCompanionSession,
    eventLabel,
    isLoaded,
    sessionProgress,
    state,
  };
}
