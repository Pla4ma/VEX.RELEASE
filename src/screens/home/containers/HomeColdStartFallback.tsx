import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { markColdStart } from '../../../app/cold-start-performance';
import { AppScreen, Button, Text } from '../../../components/primitives';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { useTheme } from '../../../theme';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface HomeColdStartFallbackProps {
  showMatchingCopy?: boolean;
}

export function HomeColdStartFallback({
  showMatchingCopy = true,
}: HomeColdStartFallbackProps): React.ReactNode {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();

  useEffect(() => {
    markColdStart('first_home_skeleton_rendered');
    markColdStart('first_actionable_cta_rendered');
  }, []);

  const startFirstSession = useCallback((): void => {
    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: { source: 'onboarding_first_session' },
    });
  }, [navigation]);

  return (
    <AppScreen scroll={false} padded>
      <View
        style={{ flex: 1, justifyContent: 'center', gap: theme.spacing[6] }}
      >
        <View style={{ gap: theme.spacing[3] }}>
          <Text variant="caption" color="text.secondary">
            Home
          </Text>
          <Text variant="h1" color="text.primary">
            Start with one clean focus block.
          </Text>
          <Text variant="body" color="text.secondary">
            VEX will adapt after the first signal. You can begin before the full
            profile finishes hydrating.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.semantic.surface,
            borderColor: theme.colors.semantic.border,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            gap: theme.spacing[3],
            padding: theme.spacing[4],
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.semantic.primarySoft,
              borderRadius: theme.borderRadius.md,
              height: theme.spacing[3],
              width: '52%',
            }}
          />
          <View
            style={{
              backgroundColor: theme.colors.semantic.surfaceElevated,
              borderRadius: theme.borderRadius.md,
              height: theme.spacing[10],
            }}
          />
          {showMatchingCopy ? (
            <Text variant="bodySmall" color="text.secondary">
              VEX is matching your mode...
            </Text>
          ) : null}
        </View>

        <Button
          <Text>accessibilityHint="Opens setup for your first focus session."</Text>
          accessibilityLabel="Start first session"
          accessibilityRole="button"
          fullWidth
          onPress={startFirstSession}
          size="lg"
          variant="primary"
        >
          Start first session
        </Button>
      </View>
    </AppScreen>
  );
}

export default HomeColdStartFallback;
