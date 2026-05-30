import React from "react";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { Box, Text, Button } from "@/components/primitives";
import { useTheme } from "@/theme";
import type { GambleOutcome } from "./types";

interface GamblingViewProps {
  streakDays: number;
}

export const GamblingView: React.FC<GamblingViewProps> = ({ streakDays }) => {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeIn}>
      <Box
        p={5}
        borderRadius={20}
        bg={theme.colors.background.secondary}
        style={{ borderWidth: 2, borderColor: theme.colors.warning.DEFAULT }}
      >
        <Box alignItems="center">
          <Text style={{ fontSize: 48 }}>🎲</Text>
          <Text variant="h2" color={theme.colors.warning.DEFAULT} mt={3}>
            Gamble in Progress!
          </Text>
          <Text
            variant="body"
            color={theme.colors.text.secondary}
            textAlign="center"
            mt={2}
          >
            Focus and give it your best shot!{"\n"}
            Score S or A to save your {streakDays}-day streak.
          </Text>

          <Box
            mt={4}
            p={3}
            borderRadius={12}
            bg={theme.colors.background.primary}
          >
            <Text
              variant="caption"
              color={theme.colors.text.tertiary}
              textAlign="center"
            >
              Session active - maintain focus for best grade
            </Text>
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
};

interface WonViewProps {
  outcome: GambleOutcome;
  onDismiss: () => void;
}

export const WonView: React.FC<WonViewProps> = ({ outcome, onDismiss }) => {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Box
        p={5}
        borderRadius={20}
        bg={theme.colors.background.secondary}
        style={{ borderWidth: 3, borderColor: theme.colors.success.DEFAULT }}
      >
        <Box alignItems="center">
          <Text style={{ fontSize: 56 }}>🏆</Text>
          <Text variant="h1" color={theme.colors.success.DEFAULT} mt={2}>
            GAMBLE WON!
          </Text>
          <Text variant="h3" color={theme.colors.text.primary} mt={1}>
            Grade {outcome.grade} - Streak Saved!
          </Text>

          <Box mt={4} alignItems="center">
            <Text variant="body" color={theme.colors.text.secondary}>
              Your skill saved the day!
            </Text>
            <Box flexDirection="row" alignItems="center" gap={2} mt={2}>
              <Text style={{ fontSize: 24 }}>⭐</Text>
              <Text variant="h3" color={theme.colors.warning.DEFAULT}>
                +{outcome.xpEarned} Bonus XP
              </Text>
            </Box>
            {outcome.shieldPreserved && (
              <Text
                variant="bodySmall"
                color={theme.colors.success.DEFAULT}
                mt={1}
              >
                🛡️ Shield preserved for future use
              </Text>
            )}
          </Box>

          <Box mt={5}>
            <Button
              variant="primary"
              size="md"
              onPress={onDismiss}
              accessibilityLabel="Continue button"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              Continue
            </Button>
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
};

interface LostViewProps {
  outcome: GambleOutcome;
  streakDays: number;
  onDismiss: () => void;
}

export const LostView: React.FC<LostViewProps> = ({
  outcome,
  streakDays,
  onDismiss,
}) => {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Box
        p={5}
        borderRadius={20}
        bg={theme.colors.background.secondary}
        style={{ borderWidth: 2, borderColor: theme.colors.error.DEFAULT }}
      >
        <Box alignItems="center">
          <Text style={{ fontSize: 48 }}>💔</Text>
          <Text variant="h2" color={theme.colors.error.DEFAULT} mt={2}>
            Gamble Failed
          </Text>
          <Text variant="h4" color={theme.colors.text.secondary} mt={1}>
            Grade {outcome.grade} - Streak Broken
          </Text>

          <Box
            mt={4}
            p={4}
            borderRadius={12}
            bg={theme.colors.background.primary}
          >
            <Text
              variant="body"
              color={theme.colors.text.secondary}
              textAlign="center"
            >
              You gave it your best shot!{"\n"}
              Your {streakDays}-day streak will reset.
            </Text>
          </Box>

          <Box mt={3}>
            <Text
              variant="caption"
              color={theme.colors.text.tertiary}
              textAlign="center"
            >
              🛡️ Good news: Your shield wasn't used
            </Text>
          </Box>

          <Box mt={5}>
            <Button
              variant="primary"
              size="md"
              onPress={onDismiss}
              accessibilityLabel="Start Fresh button"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              Start Fresh
            </Button>
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
};
