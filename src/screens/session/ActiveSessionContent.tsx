import React from 'react';
import { Box } from '../../components/primitives/Box';
import { CompanionSessionLayer } from '../../session/components/CompanionSessionLayer';
import { DeepWorkVignette } from '../../session/components/DeepWorkVignette';
import { SessionMode } from '../../session/modes';
import { ActiveSessionBackground } from './components/ActiveSessionBackground';
import { ActiveSessionHeader } from './components/ActiveSessionHeader';
import { ActiveSessionHero } from './components/ActiveSessionHero';
import { ActiveSessionModeOverlays } from './components/ActiveSessionModeOverlays';

import { CoachSessionBannerLazy } from './components/CoachSessionBannerLazy';
import { ActiveSessionBottomControls } from './ActiveSessionBottomControls';
import { ModeActiveIndicatorBar } from '../../features/mode-native/components/ModeRescueSurface';
import { useNetInfo } from '../../network';
import {
  ENABLE_SESSION_COMPANION_LAYER,
  ENABLE_SESSION_COACH_BANNER,
  ENABLE_SESSION_MODE_OVERLAYS,
  ENABLE_SESSION_HERO,
  type ActiveSessionContentProps,
} from './ActiveSessionContent.types';
import { useSessionControlHandlers } from './useSessionControlHandlers';
import { SessionNotices } from './SessionNotices';

export type { ActiveSessionContentProps };

function ActiveSessionContentRaw({
  controller,
  contract,
  currentMode,
  lane,
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
  const { isOffline } = useNetInfo();
  const activeSession = sessionQuery.session;

  const handlers = useSessionControlHandlers(actions, showMultiplierInfo, studyQuizBreak);

  if (!activeSession) {
    return <Box flex={1} bg="background.primary" />;
  }

  return (
    <Box
      flex={1}
      bg="background.primary"
      style={{ backgroundColor: themeBackgroundColor }}
    >
      <ActiveSessionBackground
        accentOverlay={metrics.withAlpha(metrics.phaseAccent, 0.06)}
        accentColor={metrics.phaseAccent}
        colors={[
          metrics.gradientState.top,
          metrics.gradientState.middle,
          metrics.gradientState.bottom,
        ]}
      />

      {currentMode === SessionMode.DEEP_WORK && focusStage !== 'active' ? (
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
      <ModeActiveIndicatorBar
        lane={lane}
        completionPercentage={sessionQuery.completionPercentage}
      />
      <SessionNotices
        isOffline={isOffline}
        showContractReminder={displayPolicy.showContractReminder}
        contract={contract}
        completionPercentage={sessionQuery.completionPercentage}
      />
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
        onClearControlFailure={handlers.onClearControlFailure}
        onRetryControlFailure={handlers.onRetryControlFailure}
        onComplete={handlers.onComplete}
        onEnd={handlers.onEnd}
        onPauseResume={handlers.onPauseResume}
        onToggleMultiplierInfo={handlers.onToggleMultiplierInfo}
        onResume={handlers.onResume}
        onAbandon={handlers.onAbandon}
      />
    </Box>
  );
}

export const ActiveSessionContent = React.memo(ActiveSessionContentRaw);

