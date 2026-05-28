import React from "react";
import { Box } from "../../components/primitives/Box";
import { CompanionSessionLayer } from "../../session/components/CompanionSessionLayer";
import { DeepWorkVignette } from "../../session/components/DeepWorkVignette";
import { SessionMode } from "../../session/modes";
import { ActiveSessionBackground } from "./components/ActiveSessionBackground";
import { ActiveSessionHeader } from "./components/ActiveSessionHeader";
import { ActiveSessionHero } from "./components/ActiveSessionHero";
import { ActiveSessionModeOverlays } from "./components/ActiveSessionModeOverlays";
import { SessionContractReminder } from "./components/SessionContractReminder";
import { CoachSessionBannerLazy } from "./components/CoachSessionBannerLazy";
import { ActiveSessionBottomControls } from "./ActiveSessionBottomControls";
import type { useActiveSessionController } from "./hooks/useActiveSessionController";
import type { useStudyQuizBreak } from "./hooks/useStudyQuizBreak";
import type { ActiveSessionDisplayPolicy } from "./utils/active-session-display-policy";
import type { ActiveSessionHeroViewModel } from "./utils/active-session-hero-view-model";
import type { FocusContract } from "../../features/focus-contract/types";

const ENABLE_SESSION_COMPANION_LAYER = true;
const ENABLE_SESSION_COACH_BANNER = true;
const ENABLE_SESSION_MODE_OVERLAYS = true;
const ENABLE_SESSION_HERO = true;

export interface ActiveSessionContentProps {
  controller: ReturnType<typeof useActiveSessionController>;
  contract: FocusContract | null;
  currentMode: SessionMode;
  displayPolicy: ActiveSessionDisplayPolicy;
  heroViewModel: ActiveSessionHeroViewModel;
  outerStrokeDashoffset: number;
  focusStage: "interruption" | "paused" | "active";
  studyQuizBreak: ReturnType<typeof useStudyQuizBreak>;
  plannedQuizBreakOptedIn: boolean;
}

export function ActiveSessionContent({
  controller,
  contract,
  currentMode,
  displayPolicy,
  heroViewModel,
  outerStrokeDashoffset,
  focusStage,
  studyQuizBreak,
  plannedQuizBreakOptedIn,
}: ActiveSessionContentProps): React.JSX.Element {
  const {
    actions,
    companion,
    controlFailure,
    metrics,
    sessionQuery,
    showInterruption,
    showMultiplierInfo,
    streak,
    theme,
    themeBackgroundColor,
    userId,
  } = controller;
  const activeSession = sessionQuery.session;

  return (
    <Box
      flex={1}
      bg="background.primary"
      style={{ backgroundColor: themeBackgroundColor }}
    >
      <ActiveSessionBackground
        accentOverlay={metrics.withAlpha(metrics.phaseAccent, 0.06)}
        colors={[
          metrics.gradientState.top,
          metrics.gradientState.middle,
          metrics.gradientState.bottom,
        ]}
      />

      {currentMode === SessionMode.DEEP_WORK && focusStage !== "active" ? (
        <DeepWorkVignette />
      ) : null}

      {ENABLE_SESSION_COMPANION_LAYER &&
      displayPolicy.showCompanionLayer &&
      companion.state &&
      currentMode !== SessionMode.DEEP_WORK ? (
        <CompanionSessionLayer
          companionState={companion.state}
          elapsedSeconds={sessionQuery.elapsedSeconds}
          eventLabel={companion.eventLabel}
          isPaused={sessionQuery.isPaused}
          purityScore={metrics.purityScore}
          sessionProgress={companion.sessionProgress}
          totalSeconds={Math.max(
            activeSession.config.duration,
            sessionQuery.elapsedSeconds + sessionQuery.remainingSeconds,
            1,
          )}
        />
      ) : null}
      <ActiveSessionHeader
        isPaused={sessionQuery.isPaused}
        theme={theme}
        onInterrupt={() => actions.setShowInterruption(true)}
      />
      {displayPolicy.showContractReminder ? (
        <SessionContractReminder
          contract={contract}
          progressPercentage={sessionQuery.completionPercentage}
        />
      ) : null}
      {ENABLE_SESSION_MODE_OVERLAYS && displayPolicy.showModeOverlay ? (
        <ActiveSessionModeOverlays
          allowStudyQuizBreak={plannedQuizBreakOptedIn}
          chainCount={activeSession.config.sprintChainCount ?? 0}
          completionPercentage={sessionQuery.completionPercentage}
          currentMode={currentMode}
          displayPolicy={displayPolicy}
          isPaused={sessionQuery.isPaused}
          quizBreakKey={studyQuizBreak.quizBreakKey}
          remainingSeconds={sessionQuery.remainingSeconds}
          studyPlanId={activeSession.config.studyPlanId}
          onCloseQuiz={(correctAnswers) => {
            studyQuizBreak.finishQuizBreak(correctAnswers);
          }}
          onCreativeMoodSelected={actions.handleCreativeMoodSelected}
          onSkipCreativeMood={actions.handleSkipCreativeMood}
          onSkipQuiz={() => {
            studyQuizBreak.finishQuizBreak();
          }}
        />
      ) : null}
      <CoachSessionBannerLazy
        userId={userId}
        showCoachBanner={
          ENABLE_SESSION_COACH_BANNER && displayPolicy.showCoachBanner
        }
        elapsedSeconds={sessionQuery.elapsedSeconds}
        isPaused={sessionQuery.isPaused}
      />

      {ENABLE_SESSION_HERO && (
        <ActiveSessionHero
          viewModel={heroViewModel}
          progressRingProps={{
            CIRCUMFERENCE: metrics.CIRCUMFERENCE,
            RADIUS: metrics.RADIUS,
            RING_SIZE: metrics.RING_SIZE,
            STROKE_WIDTH: metrics.STROKE_WIDTH,
            animatedCircleProps: metrics.animatedCircleProps,
            glowStyle: metrics.glowStyle,
            outerStrokeDashoffset,
            perfectFocusBurst: metrics.perfectFocusBurst,
            pulseStyle: metrics.pulseStyle,
            rotatingPerfectFocusStyle: metrics.rotatingPerfectFocusStyle,
            labelColor: metrics.labelColor,
            withAlpha: metrics.withAlpha,
          }}
          themeColors={{
            error: theme.colors.error.DEFAULT,
            inverse: theme.colors.text.inverse,
            primary300: theme.colors.primary[300],
            success: theme.colors.success.DEFAULT,
            warning: theme.colors.warning.light,
          }}
          isReducedMotion={heroViewModel.isReducedMotion}
        />
      )}

      <ActiveSessionBottomControls
        controlFailure={controlFailure}
        completionPercentage={sessionQuery.completionPercentage}
        isPaused={sessionQuery.isPaused}
        multiplierDays={streak?.currentDays ?? 0}
        phaseAccent={metrics.phaseAccent}
        showMultiplierInfo={showMultiplierInfo}
        streakMultiplier={metrics.streakMultiplier}
        showInterruption={showInterruption}
        elapsedSeconds={sessionQuery.elapsedSeconds}
        theme={theme}
        onClearControlFailure={actions.clearControlFailure}
        onRetryControlFailure={() => {
          actions.retryControlFailure().catch(() => undefined);
        }}
        onComplete={() => {
          actions.handleComplete().catch(() => undefined);
        }}
        onEnd={() => actions.setShowInterruption(true)}
        onPauseResume={() => {
          actions.handlePauseResume().catch(() => undefined);
        }}
        onToggleMultiplierInfo={() =>
          actions.setShowMultiplierInfo(!showMultiplierInfo)
        }
        onResume={() => actions.setShowInterruption(false)}
        onAbandon={() => {
          actions.handleAbandon().catch(() => undefined);
        }}
      />
    </Box>
  );
}
