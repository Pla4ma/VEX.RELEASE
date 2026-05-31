import type { SessionBehaviorSummary } from './session-behavior-signal-schemas';

type SignalInput = {
  signalType: string;
  timestamp: number;
  metadata?: {
    durationSeconds?: number;
    completionPercentage?: number;
    pauseCount?: number;
    studyTarget?: string | null;
    nextActionLabel?: string | null;
    dismissedEvening?: boolean;
    previousMode?: string | null;
    newMode?: string | null;
  };
};

export function summarizeSessionBehavior(
  signals: SignalInput[],
): SessionBehaviorSummary {
  let totalSessionsStarted = 0;
  let totalSessionsCompleted = 0;
  let totalSessionsAbandoned = 0;
  let totalPauses = 0;
  let totalDuration = 0;
  let durationCount = 0;
  const recentDurationsSeconds: number[] = [];
  let appOpenedNoSessionCount = 0;
  let consecutiveAppOpenedNoSession = 0;
  let maxConsecutiveNoStart = 0;
  let ctaDismissals = 0;
  let notificationDismissals = 0;
  let eveningDismissals = 0;
  let rescueStartedCount = 0;
  let rescueCompletedCount = 0;
  let reflectionCount = 0;
  let modeChanges = 0;
  let lastMode: string | null = null;
  let previousMode: string | null = null;
  let studyTargetsCompleted = 0;
  let lastStudyTarget: string | null = null;
  let projectHandoffSaved = false;
  let lastHandoffLabel: string | null = null;

  const sorted = [...signals].sort((a, b) => a.timestamp - b.timestamp);
  const resetConsecutive = () => {
    if (consecutiveAppOpenedNoSession > 0) {
      maxConsecutiveNoStart = Math.max(
        maxConsecutiveNoStart,
        consecutiveAppOpenedNoSession,
      );
      consecutiveAppOpenedNoSession = 0;
    }
  };

  for (const signal of sorted) {
    switch (signal.signalType) {
      case 'session_started':
        totalSessionsStarted++;
        resetConsecutive();
        break;
      case 'session_completed':
        totalSessionsCompleted++;
        if (signal.metadata?.durationSeconds) {
          totalDuration += signal.metadata.durationSeconds;
          durationCount++;
          recentDurationsSeconds.push(signal.metadata.durationSeconds);
        }
        resetConsecutive();
        break;
      case 'session_abandoned':
        totalSessionsAbandoned++;
        break;
      case 'session_paused':
        totalPauses++;
        if (signal.metadata?.pauseCount) {
          totalPauses += signal.metadata.pauseCount;
        }
        break;
      case 'session_resumed':
        resetConsecutive();
        break;
      case 'app_opened_no_session':
        appOpenedNoSessionCount++;
        consecutiveAppOpenedNoSession++;
        break;
      case 'cta_dismissed':
        ctaDismissals++;
        break;
      case 'notification_dismissed':
        notificationDismissals++;
        if (signal.metadata?.dismissedEvening) {
          eveningDismissals++;
        }
        break;
      case 'rescue_started':
        rescueStartedCount++;
        break;
      case 'rescue_completed':
        rescueCompletedCount++;
        break;
      case 'reflection_saved':
        reflectionCount++;
        break;
      case 'mode_changed':
        modeChanges++;
        previousMode = signal.metadata?.previousMode ?? null;
        lastMode = signal.metadata?.newMode ?? null;
        break;
      case 'study_target_completed':
        studyTargetsCompleted++;
        lastStudyTarget = signal.metadata?.studyTarget ?? null;
        break;
      case 'project_handoff_saved':
        projectHandoffSaved = true;
        lastHandoffLabel = signal.metadata?.nextActionLabel ?? null;
        break;
    }
  }

  const finalConsecutive = Math.max(
    maxConsecutiveNoStart,
    consecutiveAppOpenedNoSession,
  );

  return {
    totalSessionsStarted,
    totalSessionsCompleted,
    totalSessionsAbandoned,
    totalPauses,
    averageDurationSeconds:
      durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
    recentDurationsSeconds: recentDurationsSeconds.slice(-10),
    appOpenedNoSessionCount,
    consecutiveAppOpenedNoSession: finalConsecutive,
    ctaDismissals,
    notificationDismissals,
    eveningDismissals,
    rescueStartedCount,
    rescueCompletedCount,
    reflectionCount,
    modeChanges,
    lastMode: lastMode as SessionBehaviorSummary['lastMode'],
    previousMode: previousMode as SessionBehaviorSummary['previousMode'],
    studyTargetsCompleted,
    lastStudyTarget,
    projectHandoffSaved,
    lastHandoffLabel,
    signalCount: signals.length,
    hasEnoughData:
      totalSessionsStarted >= 2 || signals.length >= 5,
  };
}
