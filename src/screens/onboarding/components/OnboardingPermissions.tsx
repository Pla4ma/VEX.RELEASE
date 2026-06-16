import React, { useState } from 'react';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { View } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import {
  BENEFITS,
  BenefitCard,
  SuccessAnimation,
  type PermissionBenefit,
} from './OnboardingPermissions.helpers';

export type { PermissionBenefit };

interface OnboardingPermissionsProps {
  onRequestPermission: () => Promise<boolean>;
  onContinue: () => void;
}

export function OnboardingPermissions({
  onRequestPermission,
  onContinue,
}: OnboardingPermissionsProps): React.ReactNode {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;
  const [status, setStatus] = useState<
    'idle' | 'requesting' | 'granted' | 'denied'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const handleRequest = async () => {
    setStatus('requesting');
    setError(null);
    try {
      const granted = await onRequestPermission();
      setStatus(granted ? 'granted' : 'denied');
    } catch (err) {
      setStatus('denied');
      setError('Could not request permission');
    }
  };
  return (
    <Box flex={1} justifyContent="space-between" px="xl" py="2xl">
      {}
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="md" mt="xl">
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: `${semantic.primary}18`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text fontSize={28} color="primary.DEFAULT" fontWeight="700">
              N
            </Text>
          </View>
          <Box gap="sm">
            <Text variant="h2" color="text.primary">
              Stay in the loop
            </Text>
            <Text variant="body" color="text.secondary">
              Enable notifications to never miss important moments.
            </Text>
          </Box>
        </Box>
      </Animated.View>

      {}
      <Box flex={1} justifyContent="center" gap="md">
        {status === 'granted' ? (
          <SuccessAnimation />
        ) : (
          BENEFITS.map((benefit, index) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={index} />
          ))
        )}
      </Box>

      {}
      <Animated.View entering={FadeInUp.delay(400).duration(400)}>
        <Box gap="md">
          {status === 'idle' && (
            <Button
              size="lg"
              variant="primary"
              fullWidth
              onPress={handleRequest}
              isLoading={false}
              accessibilityLabel="Enable notifications"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              Enable Notifications
            </Button>
          )}

          {status === 'granted' && (
            <Button
              size="lg"
              variant="primary"
              fullWidth
              onPress={onContinue}
              accessibilityLabel="Continue"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              Continue
            </Button>
          )}

          {(status === 'denied' || status === 'idle') && (
            <Button
              size="lg"
              variant="ghost"
              fullWidth
              onPress={onContinue}
              accessibilityLabel="Perform action"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              {status === 'denied'
                ? 'Continue without notifications'
                : 'Skip for now'}
            </Button>
          )}

          {status === 'denied' && (
            <Text variant="caption" color="text.tertiary" textAlign="center">
              You can enable notifications later in Settings
            </Text>
          )}

          {error && (
            <Text variant="caption" color="error.DEFAULT" textAlign="center">
              {error}
            </Text>
          )}
        </Box>
      </Animated.View>
    </Box>
  );
}
export default OnboardingPermissions;
