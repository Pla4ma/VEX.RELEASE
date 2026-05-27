import React from "react";
import { Pressable, View, Text } from "react-native";
import { useSession } from "../hooks/useSession";
import { ActiveSessionHUDCompanion } from "./ActiveSessionHUDCompanion";
import {
  formatTime,
  getPhaseLabel,
  getStatusColor,
} from "./ActiveSessionHUD.helpers";
import styles from "./ActiveSessionHUD.styles";

interface ActiveSessionHUDProps {
  userId: string;
  onPause?: () => void;
  onResume?: () => void;
  onAbandon?: () => void;
}

export const ActiveSessionHUD: React.FC<ActiveSessionHUDProps> = ({
  userId,
  onPause,
  onResume,
  onAbandon,
}) => {
  const {
    session,
    isActive,
    isPaused,
    remainingSeconds,
    elapsedSeconds,
    completionPercentage,
    isLoading,
    error,
    pauseSession,
    resumeSession,
    abandonSession,
  } = useSession(userId);

  if (isLoading) {
    return <SessionHUDLoadingState />;
  }
  if (error) {
    return <SessionHUDErrorState error={error} />;
  }
  if (!session) {
    return <SessionHUDEmptyState />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.phaseLabel}>{getPhaseLabel(session.phase)}</Text>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(isPaused, isActive) },
          ]}
        >
          <Text style={styles.statusText}>
            {isPaused ? "PAUSED" : isActive ? "ACTIVE" : "INACTIVE"}
          </Text>
        </View>
      </View>

      <ActiveSessionHUDCompanion
        userId={userId}
        completionPercentage={completionPercentage}
        purityScore={session.purityScore || 75}
        elapsedSeconds={elapsedSeconds}
        totalSeconds={session.duration || session.config.duration || 1800}
        isPaused={isPaused}
        isActive={isActive}
      />

      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(remainingSeconds)}</Text>
        <Text style={styles.timerLabel}>remaining</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${completionPercentage}%`,
                backgroundColor: getStatusColor(isPaused, isActive),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(completionPercentage)}% complete
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.statLabel}>Elapsed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {session.currentInterval}/{session.totalIntervals}
          </Text>
          <Text style={styles.statLabel}>Interval</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{session.pauses}</Text>
          <Text style={styles.statLabel}>Pauses</Text>
        </View>
      </View>

      <View style={styles.controls}>
        {!isActive || isPaused ? (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => {
              resumeSession();
              onResume?.();
            }}
            accessibilityLabel="Resume session"
            accessibilityRole="button"
            accessibilityHint="Resumes the current focus session"
          >
            <Text style={styles.buttonText}>▶ Resume</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => {
              pauseSession();
              onPause?.();
            }}
            accessibilityLabel="Pause session"
            accessibilityRole="button"
            accessibilityHint="Pauses the current focus session"
          >
            <Text style={styles.buttonText}>⏸ Pause</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.dangerButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => {
            abandonSession();
            onAbandon?.();
          }}
          accessibilityLabel="Abandon session"
          accessibilityRole="button"
          accessibilityHint="Ends the current focus session without saving progress"
        >
          <Text style={styles.buttonText}>✕ Abandon</Text>
        </Pressable>
      </View>
    </View>
  );
};

const SessionHUDLoadingState: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.loadingText}>Loading session...</Text>
  </View>
);

const SessionHUDErrorState: React.FC<{ error: Error }> = ({ error }) => (
  <View style={styles.container}>
    <Text style={styles.errorText}>Error: {error.message}</Text>
  </View>
);

const SessionHUDEmptyState: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.emptyText}>No active session</Text>
    <Text style={styles.emptySubtext}>Create a session to get started</Text>
  </View>
);

export default ActiveSessionHUD;
