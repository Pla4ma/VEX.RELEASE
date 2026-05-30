import React, { useMemo } from "react";
import { resolveSessionMode } from "../../session/modes";
import { SessionMode } from "../../session/modes";
import { useContractForSession } from "../../features/focus-contract/hooks";
import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import { ActiveSessionGuardStates } from "./components/ActiveSessionGuardStates";
import { useActiveSessionController } from "./hooks/useActiveSessionController";
import { useStudyQuizBreak } from "./hooks/useStudyQuizBreak";
import { useActiveSessionDisplay } from "./hooks/useActiveSessionDisplay";
import { ActiveSessionContent } from "./ActiveSessionContent";
import type { Lane } from "../../features/lane-engine/types";

const SESSION_MODE_TO_LANE: Record<string, Lane> = {
  [SessionMode.STUDY]: "student",
  [SessionMode.LIGHT_FOCUS]: "game_like",
  [SessionMode.DEEP_WORK]: "deep_creative",
  [SessionMode.CREATIVE]: "minimal_normal",
};

export const ActiveSessionScreen = withScreenErrorBoundary(
  function _ActiveSessionScreen(): React.JSX.Element | null {
    const controller = useActiveSessionController();
    const {
      actions,
      isDegradedSession,
      metrics,
      navigation,
      sessionQuery,
      showInterruption,
      streak,
      theme,
      themeBackgroundColor,
      userId,
    } = controller;
    const { contract } = useContractForSession(
      controller.sessionQuery.session?.id ?? null,
    );
    const currentMode = resolveSessionMode(
      sessionQuery.session?.config.sessionMode,
    );
    const lane = useMemo(
      () => SESSION_MODE_TO_LANE[currentMode] ?? "minimal_normal",
      [currentMode],
    );
    const { displayPolicy, heroViewModel } = useActiveSessionDisplay({
      dailyProgress: metrics.dailyProgress,
      elapsedSeconds: sessionQuery.elapsedSeconds,
      completionPercentage: sessionQuery.completionPercentage,
      momentumScores: metrics.momentumScores,
      perfectFocusActive: metrics.perfectFocusActive,
      phaseAccent: metrics.phaseAccent,
      phaseIcon: metrics.phaseInfo.icon,
      phaseLabel: metrics.phaseInfo.label,
      purityLabel: metrics.purityLabel,
      purityScore: metrics.purityScore,
      remainingSeconds: sessionQuery.remainingSeconds,
      streakMultiplier: metrics.streakMultiplier,
      todayFocusSeconds: metrics.todayFocusSeconds,
      isPaused: sessionQuery.isPaused,
      showInterruption,
      sessionConfigSessionMode: sessionQuery.session?.config.sessionMode,
    });
    const outerStrokeDashoffset =
      2 * Math.PI * (metrics.RADIUS + 16) * (1 - metrics.dailyProgress / 100);
    const plannedQuizBreakOptedIn = false;
    const focusStage = showInterruption
      ? "interruption"
      : sessionQuery.isPaused
        ? "paused"
        : "active";

    const studyQuizBreak = useStudyQuizBreak({
      currentMode,
      plannedQuizBreakOptedIn,
      sessionQuery,
    });
    const shouldShowGuardState =
      !userId ||
      sessionQuery.isLoading ||
      !controller.companion.isLoaded ||
      Boolean(sessionQuery.error) ||
      !sessionQuery.session ||
      isDegradedSession;

    if (shouldShowGuardState) {
      return (
        <ActiveSessionGuardStates
          companionLoaded={controller.companion.isLoaded}
          error={sessionQuery.error}
          isDegradedSession={isDegradedSession}
          isLoading={sessionQuery.isLoading}
          session={sessionQuery.session}
          userId={userId}
          onBrowsePresets={() => navigation.goBack()}
          onContinueDegraded={() => actions.setDismissDegradedState(true)}
          onCreateSession={() =>
            navigation.navigate({ name: "SessionSetup", params: {} })
          }
          onEndSession={() => actions.setShowInterruption(true)}
          onGoBack={() => navigation.goBack()}
          onRetry={sessionQuery.refresh}
        />
      );
    }

    return (
      <ActiveSessionContent
        controller={controller}
        contract={contract}
        currentMode={currentMode}
        lane={lane}
        displayPolicy={displayPolicy}
        heroViewModel={heroViewModel}
        outerStrokeDashoffset={outerStrokeDashoffset}
        focusStage={focusStage}
        studyQuizBreak={studyQuizBreak}
        plannedQuizBreakOptedIn={plannedQuizBreakOptedIn}
      />
    );
  },
  "Active Session",
);

export default ActiveSessionScreen;
