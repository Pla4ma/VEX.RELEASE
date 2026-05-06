import { useCallback, useEffect, useRef, useState } from 'react';

import { useToast } from '../../../shared/ui/components/Toast';
import type { SessionSummary } from '../../../session/types';
import { triggerHaptic } from '../../../utils/haptics';
import { getCompanionService, type CompanionService } from '../../../features/companion/service';
import type { CompanionState } from '../../../features/companion/types';
import { SessionMode } from '../../../session/modes';
import {
  getEvolutionProgress,
  getMoodForSessionSummary,
  loadCompanionState,
  saveCompanionGrowth,
  saveCompanionState,
} from '../../../features/companion/session-storage';

type UseCompanionSessionInput = {
  currentMode: SessionMode;
  elapsedSeconds: number;
  isPaused: boolean;
  purityScore: number;
  sessionId: string;
  totalSeconds: number;
  userId: string;
};

type UseCompanionSessionResult = {
  completeCompanionSession: (summary: SessionSummary) => Promise<void>;
  eventLabel: string | null;
  isLoaded: boolean;
  sessionProgress: number;
  state: CompanionState | null;
};

const MILESTONES = [25, 50, 75, 90] as const;

function getMilestoneLabel(milestone: number, mode: SessionMode): string {
  switch (milestone) {
    case 25:
      switch (mode) {
        case SessionMode.DEEP_WORK: return 'Hold the line.';
        case SessionMode.SPRINT: return 'Sprint 1 complete.';
        case SessionMode.CREATIVE: return 'Keep the flow.';
        case SessionMode.STUDY: return '¼ done. Stay sharp.';
        default: return 'Quarter way!';
      }
    case 50:
      switch (mode) {
        case SessionMode.DEEP_WORK: return 'Halfway. Don\'t break now.';
        case SessionMode.SPRINT: return 'Sprint 2 complete. Chain active.';
        case SessionMode.CREATIVE: return 'You\'re in it. Keep going.';
        case SessionMode.STUDY: return 'Halfway. Quiz break soon.';
        default: return 'Halfway there!';
      }
    case 75:
      switch (mode) {
        case SessionMode.DEEP_WORK: return 'Final stretch. Almost there.';
        case SessionMode.SPRINT: return 'Sprint 3 done. One more.';
        case SessionMode.CREATIVE: return 'Almost done. Great mood today.';
        case SessionMode.STUDY: return 'Final quiz coming up.';
        default: return 'Almost there!';
      }
    case 90:
      switch (mode) {
        case SessionMode.DEEP_WORK: return 'Final 10%. Don\'t you dare pause.';
        case SessionMode.SPRINT: return 'Last sprint. Chain bonus on the line.';
        default: return 'Final stretch! Don\'t break now.';
      }
    default: return 'Keep going.';
  }
}

function getMilestoneHaptic(milestone: number): 'impactLight' | 'impactMedium' | 'impactHeavy' {
  if (milestone === 75) {return 'impactHeavy';}
  if (milestone === 50) {return 'impactMedium';}
  return 'impactLight';
}

export function useCompanionSession(input: UseCompanionSessionInput): UseCompanionSessionResult {
  const { currentMode, elapsedSeconds, isPaused, purityScore, sessionId, totalSeconds, userId } = input;
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
  const sessionProgress = Math.round((elapsedSeconds / Math.max(totalSeconds, 1)) * 100);
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
        if (!mounted) {return;}
        serviceRef.current = getCompanionService(loaded);
        setState(loaded);
      })
      .finally(() => {
        if (mounted) {setIsLoaded(true);}
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!serviceRef.current || !hasCompanionState || activeSessionRef.current === sessionId) {return;}
    serviceRef.current.startSession(totalSeconds / 60);
    activeSessionRef.current = sessionId;
    triggeredMilestonesRef.current = new Set();
    dangerActiveRef.current = false;
    pureFocusStartedAtRef.current = null;
    pureBurstTriggeredRef.current = false;
    setState((current) => current ? { ...current, currentMood: 'SLEEPY', sessionProgress: 0, updatedAt: Date.now() } : current);
  }, [hasCompanionState, sessionId, totalSeconds]);

  useEffect(() => {
    const service = serviceRef.current;
    if (!service || !hasCompanionState) {return;}
    service.tick(elapsedSeconds, totalSeconds, purityScore, isPaused);
    const nextState = service.getState();
    if (nextState) {setState({ ...nextState, sessionProgress });}

    for (const milestone of MILESTONES) {
      if (sessionProgress >= milestone && !triggeredMilestonesRef.current.has(milestone)) {
        triggeredMilestonesRef.current.add(milestone);
        const label = getMilestoneLabel(milestone, currentMode);
        flashEvent(label);
        void triggerHaptic(getMilestoneHaptic(milestone));
      }
    }

    if (purityScore < 60 && !dangerActiveRef.current) {
      dangerActiveRef.current = true;
      flashEvent('Struggling');
      showRef.current({ type: 'warning', title: 'Struggling', duration: 1400, priority: 'normal' });
      setState((current) => current ? { ...current, currentMood: 'STRUGGLING', updatedAt: Date.now() } : current);
      void triggerHaptic('warning');
    }
    if (purityScore >= 60) {dangerActiveRef.current = false;}

    if (purityScore > 90 && !isPaused) {
      pureFocusStartedAtRef.current ??= elapsedSeconds;
      const pureSeconds = elapsedSeconds - pureFocusStartedAtRef.current;
      if (pureSeconds >= 300 && !pureBurstTriggeredRef.current) {
        pureBurstTriggeredRef.current = true;
        flashEvent('On fire!');
        showRef.current({ type: 'success', title: 'On fire!', duration: 1400, priority: 'normal' });
        setState((current) => current ? { ...current, currentMood: 'ECSTATIC', updatedAt: Date.now() } : current);
        void triggerHaptic('success');
      }
      return;
    }
    pureFocusStartedAtRef.current = null;
    pureBurstTriggeredRef.current = false;
  }, [currentMode, elapsedSeconds, flashEvent, hasCompanionState, isPaused, purityScore, sessionProgress, totalSeconds]);

  const completeCompanionSession = useCallback(async (summary: SessionSummary): Promise<void> => {
    const service = serviceRef.current;
    if (!service || !state || !userId) {return;}
    const previousLevel = state.level;
    const minutes = Math.max(0, summary.effectiveDuration / 60000);
    const mood = getMoodForSessionSummary(summary);
    const outcome = service.completeSession(minutes, summary.focusPurityScore ?? summary.focusQuality ?? 0);
    const nextState = service.getState();
    if (!nextState) {return;}
    const saved = await saveCompanionState({ ...nextState, currentMood: mood });
    setState(saved);
    await saveCompanionGrowth(userId, {
      sessionId,
      mood,
      level: saved.level,
      phase: saved.phase,
      progressToEvolution: getEvolutionProgress(saved),
      totalFocusMinutes: saved.totalFocusMinutes,
      leveledUp: outcome.evolved || saved.level > previousLevel,
      evolved: outcome.evolved,
      updatedAt: Date.now(),
    });
  }, [sessionId, state, userId]);

  return { completeCompanionSession, eventLabel, isLoaded, sessionProgress, state };
}
