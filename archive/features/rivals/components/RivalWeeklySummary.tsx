/**
 * RivalWeeklySummary Component
 *
 * Monday modal showing weekly rivalry results.
 * Win: celebration + "You dominated this week!"
 * Loss: respectful loss + "Challenge accepted for next week?"
 * Draw: "Too close to call. Rematch?"
 * Reward: 200 coins + "Rival Slayer" temp badge.
 *
 * @phase 4A.4
 */

import React from 'react';
import { Modal, ScrollView } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { formatFocusMinutes } from '../service';

export interface RivalWeeklySummaryProps {
  /** Modal visibility */
  visible: boolean;
  /** Result type */
  result: 'WIN' | 'LOSS' | 'DRAW';
  /** Rival name */
  rivalName: string;
  /** My weekly focus minutes */
  myScore: number;
  /** Rival's weekly focus minutes */
  theirScore: number;
  /** Reward for winning (only for WIN) */
  reward?: {
    coins: number;
    badge?: string;
  };
  /** Close modal */
  onClose: () => void;
  /** View full history */
  onViewHistory?: () => void;
}

/**
 * Trophy animation for win
 */
function TrophyAnimation(): JSX.Element {
  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withSpring(1.1, { damping: 3, stiffness: 100 }),
            withSpring(1, { damping: 3, stiffness: 100 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  return (
    <Animated.View style={bounceStyle}>
      <Box
        width={120}
        height={120}
        borderRadius="full"
        bg="success.DEFAULT"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={60}>🏆</Text>
      </Box>
    </Animated.View>
  );
}

/**
 * Respectful loss icon
 */
function LossIcon(): JSX.Element {
  return (
    <Box
      width={120}
      height={120}
      borderRadius="full"
      bg="background.tertiary"
      justifyContent="center"
      alignItems="center"
      borderWidth={3}
      borderColor="border.light"
    >
      <Text fontSize={60}>🤝</Text>
    </Box>
  );
}

/**
 * Draw icon
 */
function DrawIcon(): JSX.Element {
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withRepeat(
          withSequence(
            withTiming('-5deg', { duration: 200 }),
            withTiming('5deg', { duration: 200 }),
            withTiming('0deg', { duration: 200 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  return (
    <Animated.View style={shakeStyle}>
      <Box
        width={120}
        height={120}
        borderRadius="full"
        bg="warning.DEFAULT"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={60}>⚖️</Text>
      </Box>
    </Animated.View>
  );
}

/**
 * Score comparison
 */
function ScoreComparison({
  myScore,
  theirScore,
  rivalName,
}: {
  myScore: number;
  theirScore: number;
  rivalName: string;
}): JSX.Element {
  const { theme } = useTheme();
  const diff = Math.abs(myScore - theirScore);

  return (
    <Box
      p="xl"
      borderRadius="xl"
      bg="background.secondary"
      borderWidth={1}
      borderColor="border.light"
      alignItems="center"
      gap="lg"
    >
      <Box flexDirection="row" justifyContent="space-around" width="100%">
        <Box alignItems="center">
          <Text variant="caption" color="text.tertiary" mb="xs">
            YOU
          </Text>
          <Text variant="h2" color="text.primary" fontWeight="700">
            {formatFocusMinutes(myScore)}
          </Text>
        </Box>
        <Box alignItems="center">
          <Text variant="caption" color="text.tertiary" mb="xs">
            {rivalName.toUpperCase()}
          </Text>
          <Text variant="h2" color="text.primary" fontWeight="700">
            {formatFocusMinutes(theirScore)}
          </Text>
        </Box>
      </Box>

      <Box
        width="100%"
        height={1}
        bg="border.light"
      />

      <Text variant="body" color="text.secondary" textAlign="center">
        Difference: <Text color="text.primary" fontWeight="700">{formatFocusMinutes(diff)}</Text>
      </Text>
    </Box>
  );
}

/**
 * Win reward card
 */
function WinReward({ reward }: { reward: { coins: number; badge?: string } }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box
      p="xl"
      borderRadius="xl"
      bg={`${theme.colors.success[500]}15`}
      borderWidth={2}
      borderColor="success.DEFAULT"
      alignItems="center"
      gap="lg"
    >
      <Text fontSize={48}>🎁</Text>
      <Text variant="h4" color="success.DEFAULT" textAlign="center">
        Victory Rewards
      </Text>

      <Box flexDirection="row" gap="xl">
        <Box alignItems="center">
          <Text fontSize={32}>🪙</Text>
          <Text variant="h3" color="text.primary" fontWeight="700">
            +{reward.coins}
          </Text>
          <Text variant="caption" color="text.tertiary">Coins</Text>
        </Box>

        {reward.badge && (
          <Box alignItems="center">
            <Box
              px="md"
              py="sm"
              borderRadius="lg"
              bg="accent.purple"
            >
              <Text variant="caption" color="text.inverse" fontWeight="700">
                {reward.badge}
              </Text>
            </Box>
            <Text variant="caption" color="text.tertiary" mt="xs">
              Badge
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/**
 * Main weekly summary modal
 */
export function RivalWeeklySummary({
  visible,
  result,
  rivalName,
  myScore,
  theirScore,
  reward,
  onClose,
  onViewHistory,
}: RivalWeeklySummaryProps): JSX.Element {
  const { theme } = useTheme();
  const isWin = result === 'WIN';
  const isLoss = result === 'LOSS';
  const isDraw = result === 'DRAW';

  const getTitle = () => {
    if (isWin) {return '🏆 VICTORY!';}
    if (isLoss) {return 'Good Game';}
    return '⚖️ Draw!';
  };

  const getMessage = () => {
    if (isWin) {return `You dominated this week! You focused ${formatFocusMinutes(myScore - theirScore)} more than ${rivalName}.`;}
    if (isLoss) {return `${rivalName} focused ${formatFocusMinutes(theirScore - myScore)} more this week. Challenge accepted for next week?`;}
    return 'Too close to call. You were perfectly matched! Rematch this week?';
  };

  const getColor = () => {
    if (isWin) {return 'success.DEFAULT';}
    if (isLoss) {return 'text.tertiary';}
    return 'warning.DEFAULT';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Box
        flex={1}
        bg={`${theme.colors.background.primary}F0`}
        justifyContent="center"
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingTop: 60,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeIn.duration(300)}
            style={{
              width: '100%',
              maxWidth: 400,
              alignSelf: 'center',
            }}
          >
            <Box
              bg="background.secondary"
              borderRadius="2xl"
              borderWidth={1}
              borderColor="border.light"
              overflow="hidden"
            >
              {/* Header */}
              <Box
                p="xl"
                bg={isWin ? `${theme.colors.success[500]}15` : isDraw ? `${theme.colors.warning[500]}15` : 'background.tertiary'}
                alignItems="center"
                gap="md"
              >
                {isWin && <TrophyAnimation />}
                {isLoss && <LossIcon />}
                {isDraw && <DrawIcon />}

                <Text
                  variant="h1"
                  color={getColor()}
                  textAlign="center"
                  fontWeight="800"
                >
                  {getTitle()}
                </Text>
              </Box>

              {/* Content */}
              <Box p="xl" gap="lg">
                {/* Result message */}
                <Animated.View entering={FadeInUp.duration(400).delay(200)}>
                  <Text variant="bodyLarge" color="text.secondary" textAlign="center">
                    {getMessage()}
                  </Text>
                </Animated.View>

                {/* Score comparison */}
                <Animated.View entering={FadeInUp.duration(400).delay(300)}>
                  <ScoreComparison
                    myScore={myScore}
                    theirScore={theirScore}
                    rivalName={rivalName}
                  />
                </Animated.View>

                {/* Win reward */}
                {isWin && reward && (
                  <Animated.View entering={FadeInUp.duration(400).delay(400)}>
                    <WinReward reward={reward} />
                  </Animated.View>
                )}

                {/* Loss encouragement */}
                {isLoss && (
                  <Animated.View entering={FadeInUp.duration(400).delay(400)}>
                    <Box
                      p="lg"
                      borderRadius="lg"
                      bg="background.tertiary"
                      alignItems="center"
                    >
                      <Text fontSize={32} mb="sm">💪</Text>
                      <Text variant="body" color="text.secondary" textAlign="center">
                        "The rivalry continues. Next week is yours."
                      </Text>
                    </Box>
                  </Animated.View>
                )}

                {/* Draw rematch */}
                {isDraw && (
                  <Animated.View entering={FadeInUp.duration(400).delay(400)}>
                    <Box
                      p="lg"
                      borderRadius="lg"
                      bg={`${theme.colors.warning[500]}15`}
                      borderWidth={1}
                      borderColor="warning.DEFAULT"
                      alignItems="center"
                    >
                      <Text fontSize={32} mb="sm">🔥</Text>
                      <Text variant="body" color="warning.DEFAULT" textAlign="center" fontWeight="600">
                        "This rivalry is heating up!"
                      </Text>
                    </Box>
                  </Animated.View>
                )}
              </Box>

              {/* CTAs */}
              <Box p="xl" gap="md" style={{ borderTopWidth: 1, borderTopColor: theme.colors.border.light }}>
                <Button variant="primary" size="lg" fullWidth onPress={onClose}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                  {isWin ? '🎉 Claim Victory' : isLoss ? '💪 Accept Challenge' : '🔥 Rematch!'}
                </Button>
                {onViewHistory && (
                  <Button variant="ghost" size="md" fullWidth onPress={onViewHistory}
  accessibilityLabel="View Rival History button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                    View Rival History
                  </Button>
                )}
              </Box>
            </Box>
          </Animated.View>
        </ScrollView>
      </Box>
    </Modal>
  );
}

export default RivalWeeklySummary;
