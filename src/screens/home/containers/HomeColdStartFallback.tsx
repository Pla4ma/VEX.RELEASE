import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { markColdStart } from '../../../app/cold-start-performance';
import { GlassScreen } from '../../../components/glass/GlassScreen';
import { Button } from '../../../components/primitives/Button';
import { Text , Text as VexText } from '../../../components/primitives/Text';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { navigateToRootScreen } from '../../../navigation/navigation-helpers';
import { useTheme } from '../../../theme/ThemeContext';
import { VexBackdrop } from '../../../shared/ui/vex/VexBackdrop';
import { vexFire } from '../../../theme/tokens/vex-fire';

const HOME_BACKGROUND = require('../../../../assets/vex/home-background.png');

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
    navigateToRootScreen(navigation, 'SessionStack', { screen: 'SessionSetup', params: { source: 'onboarding_first_session' } });
  }, [navigation]);

  return (
    <GlassScreen showAura={false} variant="home">
      <VexBackdrop source={HOME_BACKGROUND} overlayColor={vexFire.background} overlayOpacity={0.8} />
      <View
        style={{ flex: 1, justifyContent: 'center', gap: theme.spacing[6], paddingHorizontal: theme.spacing[4] }}
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
            backgroundColor: vexFire.panel,
            borderColor: vexFire.border,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            gap: theme.spacing[3],
            padding: theme.spacing[4],
          }}
        >
          <View
            style={{
              backgroundColor: vexFire.copper,
              borderRadius: theme.borderRadius.md,
              height: theme.spacing[3],
              width: '52%',
            }}
          />
          <View
            style={{
              backgroundColor: vexFire.backgroundSoft,
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
          accessibilityHint="Opens setup for your first focus session."
          accessibilityLabel="Start first session"
          accessibilityRole="button"
          fullWidth
          onPress={startFirstSession}
          size="lg"
          variant="primary"
        >
          <VexText>Start first session</VexText>
        </Button>
      </View>
    </GlassScreen>
  );
}
