/**
 * CoachSessionBanner
 *
 * Shows coach's name and rotating encouraging message during active session.
 * Displays below the mode indicator badge.
 * Messages rotate every 5 minutes (max 3 messages per session).
 *
 * @phase 6
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { spacing } from '../../../theme/tokens/spacing';
import { vexFire } from '../../../theme/tokens/vex-fire';

const COACH_ARTIFACT = require('../../../../assets/vex/coach/coach-artifact.png');

export type CoachPersonaStyle = 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT';

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
    'Your focus is building momentum. Keep going.',
    'Every minute of focus compounds into real progress.',
  ],
  CHEERLEADER: [
    "You're doing amazing. Keep going.",
    "You're crushing this session.",
    "Look at you focus. You're unstoppable.",
  ],
  DRILL_SERGEANT: [
    "Eyes on the clock. Don't you dare pause.",
    "You're not done yet. Keep pushing.",
    'Weakness is temporary. Focus is forever. Move.',
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
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Get messages for this persona (computed, not stored in state)
  const messages =
    ENCOURAGEMENT_MESSAGES[personaStyle] || ENCOURAGEMENT_MESSAGES.MENTOR;

  // SAFETY: message rotation depends on elapsedSeconds, which is a prop updated
  // every tick by the parent timer effect. Computing the index in an effect keeps
  // it in sync without causing extra re-renders.
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

  const totalShowTime = MAX_MESSAGES_PER_SESSION * MESSAGE_ROTATION_SECONDS;
  const currentMessage = messages[currentMessageIndex];
  const bannerStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: spacing[24] + spacing[10],
    left: spacing[4],
    right: spacing[4],
    backgroundColor: vexFire.panel,
    borderRadius: spacing[3],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing[2],
    shadowColor: vexFire.shadow,
    shadowOpacity: 0.22,
    shadowRadius: spacing[2],
    elevation: 3,
    zIndex: 10,
  }), []);
  const avatarStyle = useMemo(() => ({
    width: spacing[6],
    height: spacing[6],
    borderRadius: spacing[6],
    backgroundColor: vexFire.backgroundRaised,
    borderColor: vexFire.border,
    borderWidth: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  }), []);

  // Don't show until session has started (after 30 seconds)
  if (!hasStarted || elapsedSeconds < 30) {
    return null;
  }

  // Don't show if we've shown all messages and the session has continued.
  if (elapsedSeconds > totalShowTime + 30) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(300)}
      style={bannerStyle}
    >
      <View style={avatarStyle}>
        <Image accessibilityIgnoresInvertColors accessibilityLabel="VEX Coach artifact" source={COACH_ARTIFACT} resizeMode="contain" style={{ height: spacing[6], width: spacing[6] }} />
      </View>

      {/* Message */}
      <View style={{ flex: 1 }}>
        <Text
          variant="caption"
          color={vexFire.ember}
          weight="semibold"
          style={{ marginBottom: spacing[1] }}
        >
          {coachName}
        </Text>
        <Text
          variant="bodySmall"
          color={vexFire.cream}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {currentMessage}
        </Text>
      </View>
    </Animated.View>
  );
}
