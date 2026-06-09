import React from 'react';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { CompanionSessionLayer } from '../../session/components/CompanionSessionLayer';
import { DeepWorkVignette } from '../../session/components/DeepWorkVignette';
import { SessionMode } from '../../session/modes';
import { ActiveSessionModeOverlays } from './components/ActiveSessionModeOverlays';
import { SessionContractReminder } from './components/SessionContractReminder';
import { CoachSessionBannerLazy } from './components/CoachSessionBannerLazy';
import { ENABLE_SESSION_COMPANION_LAYER, ENABLE_SESSION_COACH_BANNER, ENABLE_SESSION_MODE_OVERLAYS} from './ActiveSessionContent.types';
import type { ActiveSessionContentProps } from './ActiveSessionContent.types';

interface SessionLayersProps {
  controller: ActiveSessionContentProps['controller'];
  contract: ActiveSessionContentProps['contract'];
  currentMode: SessionMode;
  displayPolicy: ActiveSessionContentProps['displayPolicy'];
  heroViewModel: ActiveSessionContentProps['heroViewModel'];
  isOffline: boolean;
  theme: { colors: Record<string, string> };
}

export function SessionLayers({
  controller,
  contract,
  currentMode,
  displayPolicy,
  isOffline,
  theme,
}: SessionLayersProps): JSX.Element {
  const { companion, sessionQuery, metrics } = controller;
  const activeSession = sessionQuery.session;

  return (
    <>
      {currentMode === SessionMode.DEEP_WORK && controller.focusStage !== 'active' ? (
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
            activeSession?.config.duration ?? 0,
            sessionQuery.elapsedSeconds + sessionQuery.remainingSeconds,
            1,
          )}
        />
      ) : null}

      {isOffline ? (
        <Box
          bg="warning.light"
          px="sm"
          py="xs"
          alignItems="center"
          accessibilityLabel="You are offline. Data will sync when connection returns."
          accessibilityRole="alert"
        >
          <Text variant="caption" color="text.primary">
            You are offline. Data will sync when connection returns.
          </Text>
        </Box>
      ) : null}

      {displayPolicy.showContractReminder ? (
        <SessionContractReminder
          contract={contract}
          progressPercentage={sessionQuery.completionPercentage}
        />
      ) : null}

      {ENABLE_SESSION_MODE_OVERLAYS && displayPolicy.showModeOverlay ? (
        <ActiveSessionModeOverlays
          mode={currentMode}
          theme={theme}
        />
      ) : null}

      {ENABLE_SESSION_COACH_BANNER && displayPolicy.showCoachBanner ? (
        <CoachSessionBannerLazy
          controller={controller}
        />
      ) : null}
    </>
  );
}
