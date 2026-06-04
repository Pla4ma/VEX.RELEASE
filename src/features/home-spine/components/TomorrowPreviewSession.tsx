import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { lightColors } from '@/theme/tokens/colors';

export interface TomorrowPreviewSessionProps {
  preview: {
    type:
      | 'STREAK_MILESTONE'
      | 'BOSS_NEAR_DEATH'
      | 'RIVAL_GAP'
      | 'POWER_HOUR'
      | 'CHALLENGE_RESET'
      | 'GENERIC';
    headline: string;
    subtext: string;
    emoji: string;
    actionPrompt?: string;
  };
  onPress?: () => void;
}

export function TomorrowPreviewSession({
  preview,
  onPress,
}: TomorrowPreviewSessionProps): JSX.Element {
  const { theme } = useTheme();
  const getTypeColor = () => {
    switch (preview.type) {
      case 'STREAK_MILESTONE':
        return theme.colors.warning[500];
      case 'BOSS_NEAR_DEATH':
        return theme.colors.error[500];
      case 'RIVAL_GAP':
        return theme.colors.primary[500];
      case 'POWER_HOUR':
        return lightColors.semantic.warning;
      case 'CHALLENGE_RESET':
        return lightColors.accent.green;
      default:
        return theme.colors.primary[500];
    }
  };
  const accentColor = getTypeColor();
  const CardWrapper = onPress ? Pressable : View;
  return (
    <Animated.View entering={FadeInUp.duration(500).delay(800)}>
      <CardWrapper onPress={onPress}>
        <Box
          m="lg"
          p="lg"
          borderRadius="xl"
          bg={theme.colors.background.secondary}
          borderWidth={2}
          borderColor={accentColor}
          style={{
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
            <Text fontSize={20}></Text>
            <Text variant="label" color="text.tertiary">
              TOMORROW
            </Text>
          </Box>

          <Box flexDirection="row" alignItems="flex-start" gap="md">
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.borderRadius.full,
                backgroundColor: `${accentColor}20`,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text fontSize={24}></Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                variant="h4"
                color="text.primary"
                fontWeight="700"
                style={{ marginBottom: theme.spacing[1] }}
              >
                {preview.headline}
              </Text>
              <Text variant="body" color="text.secondary">
                {preview.subtext}
              </Text>

              {preview.actionPrompt && (
                <Box
                  mt="sm"
                  px="sm"
                  py="xs"
                  borderRadius="md"
                  bg={`${accentColor}15`}
                >
                  <Text variant="caption" color={accentColor} fontWeight="600">
                    {preview.actionPrompt}
                  </Text>
                </Box>
              )}
            </View>
          </Box>
        </Box>
      </CardWrapper>
    </Animated.View>
  );
}
