import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Box, Text, Button } from '@/components/primitives';
import { formatTimeUntil } from './near-miss-helpers';

interface NearMissActionsProps {
  userName?: string;
  progressPercent: number;
  hoursUntilNext: number;
  onAcknowledge: () => void;
  onViewNextChallenge?: () => void;
  errorColor: string;
  primaryBg: string;
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  infoColor: string;
}

export const NearMissActions: React.FC<NearMissActionsProps> = ({
  userName,
  progressPercent,
  hoursUntilNext,
  onAcknowledge,
  onViewNextChallenge,
  _errorColor,
  primaryBg,
  primaryText,
  secondaryText,
  tertiaryText,
  infoColor,
}) => (
  <>
    <Box p={4} borderRadius={12} bg={primaryBg} mb={4}>
      <Box flexDirection="row" alignItems="center" gap={2} mb={2}>
        <Text style={{ fontSize: 20 }} />
        <Text variant="body" color={primaryText} fontWeight="semibold">
          You almost had it!
        </Text>
      </Box>
      <Text variant="bodySmall" color={secondaryText}>
        Near-misses like this mean you're on the right track.
        {userName ? `${userName}, y` : 'Y'}ou were just
        {Math.round(100 - progressPercent)}% away from completing this
        challenge.
      </Text>
    </Box>

    <Animated.View entering={FadeIn.delay(300)}>
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        p={3}
        borderRadius={12}
        style={{
          backgroundColor: `${infoColor}15`,
          borderWidth: 1,
          borderColor: `${infoColor}30`,
        }}
        mb={4}
      >
        <Text style={{ fontSize: 20, marginRight: 8 }} />
        <Text variant="body" color={infoColor}>
          Next challenge in {formatTimeUntil(hoursUntilNext)}
        </Text>
      </Box>
    </Animated.View>

    <Box gap={3}>
      <Button
        variant="primary"
        size="md"
        fullWidth
        onPress={onAcknowledge}
        accessibilityLabel="I'll get it next time"
        accessibilityRole="button"
        accessibilityHint="Double tap to select"
      >
        I'll Get It Next Time
      </Button>
      {onViewNextChallenge && (
        <Button
          variant="outline"
          size="md"
          fullWidth
          onPress={onViewNextChallenge}
          accessibilityLabel="View upcoming challenges"
          accessibilityRole="button"
          accessibilityHint="Double tap to select"
        >
          View Upcoming Challenges
        </Button>
      )}
    </Box>

    <Box mt={4} alignItems="center">
      <Text variant="caption" color={tertiaryText} textAlign="center">
        "This one got away... but the next one is yours."
      </Text>
    </Box>
  </>
);
