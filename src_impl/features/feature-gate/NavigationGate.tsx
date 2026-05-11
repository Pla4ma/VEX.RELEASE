/**
 * NavigationGate Component
 *
 * Provides safe fallback navigation for disabled features.
 * Redirects to appropriate screens when features are disabled.
 */

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { Button } from '../../components/primitives/Button';
import { useTheme } from '../../theme';
import type { ExtendedRootStackParams } from '../../navigation/types';

interface NavigationGateProps {
  featureName: string;
  featureReason: string;
  suggestedAction?: string;
  suggestedRoute?: keyof ExtendedRootStackParams;
}

export function NavigationGate({
  featureName,
  featureReason,
  suggestedAction = 'Return to Home',
  suggestedRoute = 'Main',
}: NavigationGateProps): JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const { theme } = useTheme();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(suggestedRoute);
    }
  };

  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      p="lg"
      bg={theme.colors.background.primary}
    >
      <Box
        maxWidth={300}
        alignItems="center"
        gap="md"
      >
        <Text fontSize={48}>🔒</Text>

        <Text
          variant="h3"
          color="text.primary"
          textAlign="center"
        >
          Feature Not Available
        </Text>

        <Text
          variant="body"
          color="text.secondary"
          textAlign="center"
          style={{ lineHeight: 22 }}
        >
          {featureName} is {featureReason.toLowerCase()}.
        </Text>

        <Button
          variant="primary"
          onPress={handleGoBack}
          style={{ marginTop: theme.spacing[4] }}
        >
          {suggestedAction}
        </Button>
      </Box>
    </Box>
  );
}
