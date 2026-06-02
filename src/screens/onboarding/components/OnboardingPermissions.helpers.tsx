import React from 'react';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { View } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

export interface PermissionBenefit {
  mark: string;
  title: string;
  description: string;
}

export const BENEFITS: PermissionBenefit[] = [
  {
    mark: 'S',
    title: 'Streak Protection',
    description: 'Get notified when your streak is about to break',
  },
  {
    mark: 'C',
    title: 'Challenge Alerts',
    description: 'Never miss a focus session opportunity',
  },
  {
    mark: 'F',
    title: 'Focus Squad Updates',
    description: 'Get notified when focus sessions begin',
  },
];

export function BenefitCard({
  benefit,
  index,
}: {
  benefit: PermissionBenefit;
  index: number;
}): JSX.Element {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;
  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
      <Box
        flexDirection="row"
        alignItems="center"
        gap="md"
        p="md"
        borderRadius="xl"
        bg={theme.colors.background.secondary}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${semantic.primary}15`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text fontSize={20} color="primary.DEFAULT" fontWeight="700">
            {benefit.mark}
          </Text>
        </View>

        <Box flex={1} gap="xs">
          <Text variant="body" color="text.primary" fontWeight="600">
            {benefit.title}
          </Text>
          <Text variant="caption" color="text.secondary">
            {benefit.description}
          </Text>
        </Box>
      </Box>
    </Animated.View>
  );
}

export function SuccessAnimation(): JSX.Element {
  const scale = useSharedValue(0);
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;
  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  }, [scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animatedStyle}>
      <Box alignItems="center" gap="md">
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: `${semantic.success}20`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text fontSize={32} color="success.DEFAULT" fontWeight="700">
            &#x2713;
          </Text>
        </View>
        <Text variant="h4" color="success.DEFAULT">
          All set
        </Text>
      </Box>
    </Animated.View>
  );
}
