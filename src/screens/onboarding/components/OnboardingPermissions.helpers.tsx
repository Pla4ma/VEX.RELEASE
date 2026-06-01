import React from 'react';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { launchColors } from '@theme/tokens/launch-colors';

export interface PermissionBenefit {
  icon: string;
  title: string;
  description: string;
}

export const BENEFITS: PermissionBenefit[] = [
  {
    icon: '🔥',
    title: 'Streak at Risk Alerts',
    description: 'Get notified when your streak is about to break',
  },
  {
    icon: '👹',
    title: 'Boss Spawn Alerts',
    description: 'Never miss a boss encounter opportunity',
  },
  {
    icon: '⚔️',
    title: 'Squad Challenges',
    description: 'Get notified when squad wars start',
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
        <Box
          width={48}
          height={48}
          borderRadius="lg"
          bg={`${theme.colors.primary[500]}15`}
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize={24}>{benefit.icon}</Text>
        </Box>

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
  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  }, [scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animatedStyle}>
      <Box alignItems="center" gap="md">
        <Box
          width={80}
          height={80}
          borderRadius="full"
          bg={launchColors.hex_22c55e30}
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize={40}>✓</Text>
        </Box>
        <Text variant="h4" color="success.DEFAULT">
          All set!
        </Text>
      </Box>
    </Animated.View>
  );
}
