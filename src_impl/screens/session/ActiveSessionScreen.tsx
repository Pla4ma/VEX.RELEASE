import React from 'react';
import { Box } from '../../components/primitives/Box';
import { CompanionSessionLayer } from '../../session/components/CompanionSessionLayer';
import { DeepWorkVignette } from '../../session/components/DeepWorkVignette';
import { CoachSessionBanner } from '../../features/ai-coach/components/CoachSessionBanner';
import { InterruptionWarning } from '../../session/components/InterruptionWarning';
import { resolveSessionMode, SessionMode } from '../../session/modes';
import { ActiveSessionBackground } from './components/ActiveSessionBackground';
import { ActiveSessionControlDock } from './components/ActiveSessionControlDock';
import { ActiveSessionGuardStates } from './components/ActiveSessionGuardStates';
import { ActiveSessionHeader } from './components/ActiveSessionHeader';
import { ActiveSessionHero } from './components/ActiveSessionHero';
import { ActiveSessionModeOverlays } from './components/ActiveSessionModeOverlays';
import { useActiveSessionController } from './hooks/useActiveSessionController';
import { useStudyQuizBreak } from './hooks/useStudyQuizBreak';
import { useCoachState } from '../../features/ai-coach/hooks';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';

const ENABLE_SESSION_COMPANION_LAYER = true;
const ENABLE_SESSION_COACH_BANNER = true;
const ENABLE_SESSION_MODE_OVERLAYS = true;
const ENABLE_SESSION_HERO = true;

export const ActiveSessionScreen = withScreenErrorBoundary(function _ActiveSessionScreen(): React.JSX.Element | null {
  const controller = useActiveSessionController();
  const { actions, isDegradedSession, metrics, navigation, sessionQuery, showInterruption, showMultiplierInfo, streak, theme, themeBackgroundColor, userId } = controller;
  const { data: coachState } = useCoachState(userId || '');
  const outerRadius = metrics.RADIUS + 16;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerStrokeDashoffset = outerCircumference * (1 - metrics.dailyProgress / 100);
  const currentMode = resolveSessionMode(sessionQuery.session?.config.sessionMode);
  const studyQuizBreak = useStudyQuizBreak({ currentMode, sessionQuery });
  const shouldShowGuardState =
    !userId || sessionQuery.isLoading || !controller.companion.isLoaded || Boolean(sessionQuery.error) || !sessionQuery.session || isDegradedSession;

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
        onCreateSession={() => navigation.navigate({ name: 'SessionSetup', params: {} })}
        onEndSession={() => actions.setShowInterruption(true)}
        onGoBack={() => navigation.goBack()}
        onRetry={sessionQuery.refresh}
      />
    );
  }
  const activeSession = sessionQuery.session;
  if (!activeSession) {return null;}

  return (
    <Box flex={1} bg="background.primary" style={{ backgroundColor: themeBackgroundColor }}>
      <ActiveSessionBackground
        accentOverlay={metrics.withAlpha(metrics.phaseAccent, 0.06)}
        colors={[metrics.gradientState.top, metrics.gradientState.middle, metrics.gradientState.bottom]}
      />

      {currentMode === SessionMode.DEEP_WORK && <DeepWorkVignette />}

      {ENABLE_SESSION_COMPANION_LAYER && controller.companion.state && currentMode !== SessionMode.DEEP_WORK ? (
        <CompanionSessionLayer
          companionState={controller.companion.state}
          elapsedSeconds={sessionQuery.elapsedSeconds}
          eventLabel={controller.companion.eventLabel}
          isPaused={sessionQuery.isPaused}
          purityScore={metrics.purityScore}
          sessionProgress={controller.companion.sessionProgress}
          totalSeconds={Math.max(
            activeSession.config.duration,
            sessionQuery.elapsedSeconds + sessionQuery.remainingSeconds,
            1,
          )}
        />
      ) : null}

      <ActiveSessionHeader isPaused={sessionQuery.isPaused} theme={theme} onInterrupt={() => actions.setShowInterruption(true)} />

      {ENABLE_SESSION_MODE_OVERLAYS && (
        <ActiveSessionModeOverlays
          chainCount={activeSession.config.sprintChainCount ?? 0}
          completionPercentage={sessionQuery.completionPercentage}
          currentMode={currentMode}
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
      )}

      {/* Coach Session Banner - Phase 6.5 */}
      {ENABLE_SESSION_COACH_BANNER && coachState && (
        <CoachSessionBanner
          coachName="Coach"
          personaStyle={coachState.currentState === 'OVERLOAD_PROTECTION' ? 'DRILL_SERGEANT' : 'MENTOR'}
          elapsedSeconds={sessionQuery.elapsedSeconds}
          isPaused={sessionQuery.isPaused}
        />
      )}


      {ENABLE_SESSION_HERO && (
        <ActiveSessionHero
          CIRCUMFERENCE={metrics.CIRCUMFERENCE}
          RADIUS={metrics.RADIUS}
          RING_SIZE={metrics.RING_SIZE}
          STROKE_WIDTH={metrics.STROKE_WIDTH}
          animatedCircleProps={metrics.animatedCircleProps}
          completionPercentage={sessionQuery.completionPercentage}
          dailyProgress={metrics.dailyProgress}
          elapsedSeconds={sessionQuery.elapsedSeconds}
          glowStyle={metrics.glowStyle}
          labelColor={metrics.labelColor}
          momentumScores={metrics.momentumScores}
          outerStrokeDashoffset={outerStrokeDashoffset}
          perfectFocusActive={metrics.perfectFocusActive}
          perfectFocusBurst={metrics.perfectFocusBurst}
          phaseAccent={metrics.phaseAccent}
          phaseIcon={metrics.phaseInfo.icon}
          phaseLabel={metrics.phaseInfo.label}
          pulseStyle={metrics.pulseStyle}
          purityLabel={metrics.purityLabel}
          purityScore={metrics.purityScore}
          remainingSeconds={sessionQuery.remainingSeconds}
          rotatingPerfectFocusStyle={metrics.rotatingPerfectFocusStyle}
          streakMultiplier={metrics.streakMultiplier}
          themeColors={{
            error: theme.colors.error.DEFAULT,
            inverse: theme.colors.text.inverse,
            primary300: theme.colors.primary[300],
            success: theme.colors.success.DEFAULT,
            warning: theme.colors.warning.light,
          }}
          todayFocusSeconds={metrics.todayFocusSeconds}
          withAlpha={metrics.withAlpha}
        />
      )}

      <ActiveSessionControlDock
        completionPercentage={sessionQuery.completionPercentage}
        isPaused={sessionQuery.isPaused}
        multiplierDays={streak?.currentDays ?? 0}
        phaseAccent={metrics.phaseAccent}
        showMultiplierInfo={showMultiplierInfo}
        streakMultiplier={metrics.streakMultiplier}
        themeColors={{
          backgroundElevated: theme.colors.background.elevated,
          border: theme.colors.border.light,
          error: theme.colors.error.DEFAULT,
          info: theme.colors.info.DEFAULT,
          inverse: theme.colors.text.inverse,
          success: theme.colors.success.DEFAULT,
        }}
        onComplete={() => void actions.handleComplete()}
        onEnd={() => actions.setShowInterruption(true)}
        onPauseResume={() => void actions.handlePauseResume()}
        onToggleMultiplierInfo={() => actions.setShowMultiplierInfo(!showMultiplierInfo)}
      />

      <InterruptionWarning
        isVisible={showInterruption}
        severity={sessionQuery.elapsedSeconds > 300 ? 'MAJOR' : 'MINOR'}
        countdownSeconds={30}
        interruptionType="User Initiated"
        onResume={() => actions.setShowInterruption(false)}
        onAbandon={() => void actions.handleAbandon()}
        hasStreakSave={false}
      />
    </Box>
  );
}, 'Active Session');

export default ActiveSessionScreen;
