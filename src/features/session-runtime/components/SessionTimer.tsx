/**
 * Session Timer Component
 *
 * Displays the active session timer with progress visualization.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
import { fontFamilies } from '../../../theme/tokens/typography';
import { EnterAnimation } from '../../../shared/ui/components/EnterAnimation';
import { createSheet } from '@/shared/ui/create-sheet';

interface SessionTimerProps {
  elapsedSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showProgress?: boolean;
}

export const SessionTimer = React.memo(function SessionTimer({
  elapsedSeconds,
  totalSeconds,
  isPaused,
  size = 'lg',
}: SessionTimerProps) {
  const { theme } = useTheme();
  const progress = Math.min(elapsedSeconds / totalSeconds, 1);
  const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0);

  const s = sizeStyles[size];
  const _radius = (s.size - s.strokeWidth) / 2;
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingDisplaySeconds = remainingSeconds % 60;
  const timerAccessibilityLabel = `Timer: ${remainingMinutes} minutes ${remainingDisplaySeconds} seconds remaining`;

  return (
    <EnterAnimation direction="fade" delay={100}>
      <View
        accessibilityLabel={timerAccessibilityLabel}
        accessibilityLiveRegion="polite"
        accessibilityRole="timer"
        accessible
        style={[styles.container, { width: s.size, height: s.size }]}
      >
        {/* Background circle */}
        <View style={[styles.circle, { width: s.size, height: s.size }]}>
          <View
            style={[
              styles.backgroundRing,
              {
                width: s.size,
                height: s.size,
                borderRadius: s.size / 2,
                borderWidth: s.strokeWidth,
                borderColor: theme.colors.background.tertiary,
              },
            ]}
          />
        </View>

        {/* Progress circle */}
        <View
          style={[
            styles.circle,
            {
              width: s.size,
              height: s.size,
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        >
          <View
            style={[
              styles.progressRing,
              {
                width: s.size,
                height: s.size,
                borderRadius: s.size / 2,
                borderWidth: s.strokeWidth,
                borderColor: isPaused
                  ? theme.colors.warning.DEFAULT
                  : theme.colors.success.DEFAULT,
                borderLeftColor: 'transparent',
                borderBottomColor: 'transparent',
                transform: [{ rotate: `${progress * 360}deg` }],
              },
            ]}
          />
        </View>

        {/* Time display */}
        <View style={styles.timeContainer}>
          <Text
            style={[
              styles.timeText,
              {
                fontSize: s.fontSize,
                color: theme.colors.text.primary,
                fontFamily: fontFamilies.mono ?? 'monospace',
              },
            ]}
          >
            {formatTime(remainingSeconds)}
          </Text>
          {isPaused && (
            <Text
              style={[
                styles.pausedText,
                { color: theme.colors.warning.DEFAULT },
              ]}
            >
              PAUSED
            </Text>
          )}
        </View>
      </View>
    </EnterAnimation>
  );
});

const sizeStyles = {
    sm: { fontSize: 24, strokeWidth: 4, size: 80 },
    md: { fontSize: 36, strokeWidth: 6, size: 120 },
    lg: { fontSize: 56, strokeWidth: 8, size: 200 },
    hero: { fontSize: 80, strokeWidth: 12, size: 280 },
  } as const;

const styles = createSheet({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
  },
  backgroundRing: {
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
  },
  timeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontWeight: '700',
    letterSpacing: 2,
  },
  pausedText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});