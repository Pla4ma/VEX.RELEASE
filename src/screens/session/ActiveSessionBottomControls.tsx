import React from "react";
import { InterruptionWarning } from "../../session/components/InterruptionWarning";
import { ActiveSessionControlDock } from "./components/ActiveSessionControlDock";
import { ActiveSessionControlRecovery } from "./components/ActiveSessionControlRecovery";
import type { ActiveSessionControlFailure } from "../utils/active-session-control-failure";

interface ActiveSessionBottomControlsProps {
  controlFailure: ActiveSessionControlFailure | null;
  completionPercentage: number;
  isPaused: boolean;
  multiplierDays: number;
  phaseAccent: string;
  showMultiplierInfo: boolean;
  streakMultiplier: number;
  showInterruption: boolean;
  elapsedSeconds: number;
  theme: {
    colors: {
      background: { elevated: string };
      border: { light: string };
      error: { DEFAULT: string };
      info: { DEFAULT: string };
      text: { inverse: string };
      success: { DEFAULT: string };
    };
  };
  onClearControlFailure: () => void;
  onRetryControlFailure: () => void;
  onComplete: () => void;
  onEnd: () => void;
  onPauseResume: () => void;
  onToggleMultiplierInfo: () => void;
  onResume: () => void;
  onAbandon: () => void;
}

export function ActiveSessionBottomControls({
  controlFailure,
  completionPercentage,
  isPaused,
  multiplierDays,
  phaseAccent,
  showMultiplierInfo,
  streakMultiplier,
  showInterruption,
  elapsedSeconds,
  theme,
  onClearControlFailure,
  onRetryControlFailure,
  onComplete,
  onEnd,
  onPauseResume,
  onToggleMultiplierInfo,
  onResume,
  onAbandon,
}: ActiveSessionBottomControlsProps): React.JSX.Element {
  return (
    <>
      {controlFailure ? (
        <ActiveSessionControlRecovery
          failure={controlFailure}
          onDismiss={onClearControlFailure}
          onRetry={() => {
            onRetryControlFailure();
          }}
        />
      ) : null}

      <ActiveSessionControlDock
        completionPercentage={completionPercentage}
        isPaused={isPaused}
        multiplierDays={multiplierDays}
        phaseAccent={phaseAccent}
        showMultiplierInfo={showMultiplierInfo}
        streakMultiplier={streakMultiplier}
        themeColors={{
          backgroundElevated: theme.colors.background.elevated,
          border: theme.colors.border.light,
          error: theme.colors.error.DEFAULT,
          info: theme.colors.info.DEFAULT,
          inverse: theme.colors.text.inverse,
          success: theme.colors.success.DEFAULT,
        }}
        onComplete={onComplete}
        onEnd={onEnd}
        onPauseResume={onPauseResume}
        onToggleMultiplierInfo={onToggleMultiplierInfo}
      />

      <InterruptionWarning
        isVisible={showInterruption}
        severity={elapsedSeconds > 300 ? "MAJOR" : "MINOR"}
        countdownSeconds={30}
        interruptionType="User Initiated"
        onResume={onResume}
        onAbandon={onAbandon}
        hasStreakSave={false}
      />
    </>
  );
}
