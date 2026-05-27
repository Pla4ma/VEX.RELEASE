/**
 * CoachSessionBanner
 *
 * Shows coach's name and rotating encouraging message during active session.
 * Displays below the mode indicator badge.
 * Messages rotate every 5 minutes (max 3 messages per session).
 *
 * @phase 6
 */

import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeContext";
import { Text } from "../../../components";

export type CoachPersonaStyle = "MENTOR" | "CHEERLEADER" | "DRILL_SERGEANT";

interface CoachSessionBannerProps {
  coachName: string;
  personaStyle: CoachPersonaStyle;
  elapsedSeconds: number;
  isPaused: boolean;
}

// Mid-session encouragement messages by persona (3 per persona = 9 total)
const ENCOURAGEMENT_MESSAGES: Record<CoachPersonaStyle, string[]> = {
  MENTOR: [
    "You're halfway there. Stay consistent.",
    "Your focus is building momentum. Keep going.",
    "Every minute of focus compounds into real progress.",
  ],
  CHEERLEADER: [
    "You're doing amazing! Keep going! 💪",
    "OMG you're CRUSHING this session! 🌟",
    "Look at you FOCUS! You're unstoppable! 🔥",
  ],
  DRILL_SERGEANT: [
    "Eyes on the clock. Don't you dare pause.",
    "You're not done yet. Keep pushing.",
    "Weakness is temporary. Focus is forever. Move.",
  ],
};

// Message rotation interval: 5 minutes = 300 seconds
const MESSAGE_ROTATION_SECONDS = 300;
const MAX_MESSAGES_PER_SESSION = 3;

export function CoachSessionBanner({
  coachName,
  personaStyle,
  elapsedSeconds,
  isPaused,
}: CoachSessionBannerProps): JSX.Element | null {
  const { theme } = useTheme();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Get messages for this persona
  const messages =
    ENCOURAGEMENT_MESSAGES[personaStyle] || ENCOURAGEMENT_MESSAGES.MENTOR;

  // Rotate messages every 5 minutes, max 3 messages
  useEffect(() => {
    if (isPaused) {
      return;
    }

    const minutesElapsed = Math.floor(elapsedSeconds / 60);
    const newMessageIndex = Math.min(
      Math.floor(minutesElapsed / (MESSAGE_ROTATION_SECONDS / 60)),
      MAX_MESSAGES_PER_SESSION - 1,
    );

    if (
      newMessageIndex !== currentMessageIndex &&
      newMessageIndex < MAX_MESSAGES_PER_SESSION
    ) {
      setCurrentMessageIndex(newMessageIndex);
    }

    if (elapsedSeconds > 0 && !hasStarted) {
      setHasStarted(true);
    }
  }, [elapsedSeconds, isPaused, currentMessageIndex, hasStarted]);

  // Don't show until session has started (after 30 seconds)
  if (!hasStarted || elapsedSeconds < 30) {
    return null;
  }

  // Don't show if we've shown all 3 messages and 15 minutes have passed
  const totalShowTime = MAX_MESSAGES_PER_SESSION * MESSAGE_ROTATION_SECONDS;
  if (elapsedSeconds > totalShowTime + 30) {
    return null;
  }

  const currentMessage = messages[currentMessageIndex];

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(300)}
      style={{
        position: "absolute",
        top: 140, // Below mode indicator badge
        left: theme.spacing[4],
        right: theme.spacing[4],
        backgroundColor: theme.colors.background.elevated + "E6", // 90% opacity
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[3],
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing[2],
        shadowColor: theme.colors.text.primary + "20",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
      }}
    >
      {/* Coach Avatar Placeholder */}
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.colors.primary[500] + "20",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text fontSize={14}>
          {personaStyle === "DRILL_SERGEANT"
            ? "💀"
            : personaStyle === "CHEERLEADER"
              ? "🎉"
              : "🧠"}
        </Text>
      </View>

      {/* Message */}
      <View style={{ flex: 1 }}>
        <Text
          variant="caption"
          color="secondary"
          weight="semibold"
          style={{ marginBottom: 2 }}
        >
          {coachName}
        </Text>
        <Text
          variant="bodySmall"
          color="primary"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {currentMessage}
        </Text>
      </View>
    </Animated.View>
  );
}
