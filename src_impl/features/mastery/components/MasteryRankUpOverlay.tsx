import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { Box, Card, Text } from '../../../components/primitives';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { useMasteryRankUpSpectacle } from '../../spectacle/hooks';
import { getMasteryRankDisplay } from '../types';
import { launchColors } from '@theme/tokens/launch-colors';


export function MasteryRankUpOverlay(): JSX.Element | null {
  const { theme } = useTheme();
  const { event, isActive, dismiss, unlockedFeatures } = useMasteryRankUpSpectacle();

  if (!isActive || !event) {return null;}

  const oldRankDisplay = getMasteryRankDisplay(event.oldRank as import('../types').MasteryRank);
  const newRankDisplay = getMasteryRankDisplay(event.newRank as import('../types').MasteryRank);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: launchColors.rgb_0_0_0_0_85,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <Pressable style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={dismiss}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Animated.View entering={ZoomIn.duration(500).delay(200)}>
          <Card
            size="lg"
            style={{
              backgroundColor: theme.colors.background.secondary,
              borderWidth: 2,
              borderColor: newRankDisplay.color,
              maxWidth: 340,
              marginHorizontal: theme.spacing[5],
            }}
          >
            <Box alignItems="center" gap="lg">
              {/* Rank Icon */}
              <Animated.View entering={FadeInUp.duration(400).delay(400)}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: `${newRankDisplay.color}25`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: newRankDisplay.color,
                  }}
                >
                  <Text fontSize={40}>{newRankDisplay.icon}</Text>
                </View>
              </Animated.View>

              {/* Title */}
              <Animated.View entering={FadeInUp.duration(400).delay(500)}>
                <Box alignItems="center" gap="xs">
                  <Text variant="h3" color="text.primary" textAlign="center" fontWeight="700">
                    MASTERY RANK UP!
                  </Text>
                  <Text variant="body" color="text.secondary" textAlign="center">
                    {oldRankDisplay.title} → {newRankDisplay.title}
                  </Text>
                </Box>
              </Animated.View>

              {/* New Rank Badge */}
              <Animated.View entering={FadeInUp.duration(400).delay(600)}>
                <View
                  style={{
                    paddingHorizontal: theme.spacing[4],
                    paddingVertical: theme.spacing[3],
                    borderRadius: 16,
                    backgroundColor: `${newRankDisplay.color}20`,
                    borderWidth: 1,
                    borderColor: newRankDisplay.color,
                  }}
                >
                  <Text variant="h2" style={{ color: newRankDisplay.color, fontWeight: '800' }}>
                    {newRankDisplay.title}
                  </Text>
                </View>
              </Animated.View>

              {/* Points */}
              <Animated.View entering={FadeInUp.duration(400).delay(700)}>
                <Text variant="body" color="text.secondary" textAlign="center">
                  {event.totalPoints} total mastery points
                </Text>
              </Animated.View>

              {/* Unlocked Features */}
              {unlockedFeatures.length > 0 && (
                <Animated.View entering={FadeInUp.duration(400).delay(800)} style={{ width: '100%' }}>
                  <View
                    style={{
                      backgroundColor: theme.colors.background.tertiary,
                      borderRadius: 12,
                      padding: theme.spacing[3],
                      gap: theme.spacing[2],
                    }}
                  >
                    <Text variant="caption" color="text.tertiary" textAlign="center" fontWeight="600">
                      UNLOCKED
                    </Text>
                    {unlockedFeatures.map((feature: string, index: number) => (
                      <Box key={index} flexDirection="row" alignItems="center" gap="sm">
                        <Text fontSize={14}>✨</Text>
                        <Text variant="bodySmall" color="success.DEFAULT">
                          {feature}
                        </Text>
                      </Box>
                    ))}
                  </View>
                </Animated.View>
              )}

              {/* Dismiss Button */}
              <Animated.View entering={FadeInUp.duration(400).delay(900)}>
                <Button
                  variant="primary"
                  onPress={dismiss}
                  accessibilityLabel="Continue"
                  accessibilityRole="button"

                accessibilityHint="Activates this control">
                  Continue
                </Button>
              </Animated.View>
            </Box>
          </Card>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
