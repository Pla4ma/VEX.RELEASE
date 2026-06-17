import React, { useEffect } from 'react';
import { Modal, ScrollView, useWindowDimensions } from 'react-native';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { ConfettiBurst } from './Confetti';
import { StreakFlame, RewardItem } from './StreakFlame';

export interface StreakMilestoneModalProps {
  visible: boolean;
  milestone: number;
  rewards: { coins: number; gems?: number; exclusiveItem?: string };
  onDismiss: () => void;
  onShare?: () => void;
}

export function StreakMilestoneModal({
  visible,
  milestone,
  rewards,
  onDismiss,
  onShare,
}: StreakMilestoneModalProps): React.ReactNode {
  const { theme } = useTheme();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {}, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible]);

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
          contentContainerStyle={{ padding: 20, minHeight: SCREEN_HEIGHT }}
          showsVerticalScrollIndicator={false}
        >
          <ConfettiBurst count={60} />

          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            py="xl"
            gap="xl"
          >
            <Animated.View entering={FadeInUp.duration(600).delay(200)}>
              <Box alignItems="center" gap="sm">
                <Text variant="label" color="accent.orange">
                  MILESTONE REACHED
                </Text>
                <Box alignItems="center" gap="md">
                  <StreakFlame days={milestone} />
                  <Text
                    variant="hero"
                    color="text.primary"
                    fontWeight="900"
                    textAlign="center"
                  >
                    {milestone}-Day Streak!
                  </Text>
                </Box>
              </Box>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.duration(500).delay(800)}
              style={{ width: '100%' }}
            >
              <Box
                p="xl"
                borderRadius="2xl"
                bg="background.secondary"
                borderWidth={2}
                borderColor="accent.orange"
                gap="lg"
              >
                <Text variant="h4" color="text.primary" textAlign="center">
                  Rewards Unlocked
                </Text>

                <Box
                  flexDirection="row"
                  justifyContent="space-around"
                  flexWrap="wrap"
                  gap="md"
                >
                  <RewardItem
                    emoji="🪙"
                    value={`+${rewards.coins}`}
                    label="Coins"
                  />
                  {rewards.gems && (
                    <RewardItem
                      emoji="💎"
                      value={`+${rewards.gems}`}
                      label="Gems"
                    />
                  )}
                  {rewards.exclusiveItem && (
                    <RewardItem
                      emoji="🎁"
                      value={rewards.exclusiveItem}
                      label="Exclusive Item"
                      isNew
                    />
                  )}
                </Box>
              </Box>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(500).delay(1200)}>
              <Box alignItems="center" gap="sm">
                <Text variant="body" color="text.secondary" textAlign="center">
                  {milestone >= 100
                    ? 'LEGENDARY! Few achieve this level of focus.'
                    : milestone >= 30
                      ? "Incredible dedication! You're unstoppable."
                      : milestone >= 7
                        ? 'A full week of focus! Keep the momentum.'
                        : 'Great start! Your streak is growing.'}
                </Text>
              </Box>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.duration(500).delay(1400)}
              style={{ width: '100%', marginTop: 20 }}
            >
              <Box gap="md">
                {onShare && (
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    leftIcon={
                      <Icon name="share" size="sm" color="primary" variant="solid" />
                    }
                    onPress={onShare}
                    accessibilityLabel={`Share ${milestone}-day streak`}
                    accessibilityRole="button"
                    accessibilityHint="Double tap to activate"
                  >
                    {`Share my ${milestone}-day streak`}
                  </Button>
                )}
                <Button variant="primary"
                  size="lg"
                  fullWidth
                  onPress={onDismiss}
                  accessibilityLabel="Continue after milestone celebration"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to activate"
                >
                  Continue →
                </Button>
              </Box>
            </Animated.View>
          </Box>
        </ScrollView>
      </Box>
    </Modal>
  );
}

export default StreakMilestoneModal;
