import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Icon } from '../../../icons/components/Icon';
import { Text } from '../../../components/primitives/Text';
import { VexSurface } from '../../../shared/ui/vex/VexSurface';
import { useTheme } from '../../../theme/ThemeContext';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { HomeController } from '../hooks/home-controller-types';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface HomeDailyCardsProps {
  controller: HomeController;
  onStartSession: () => void;
  includeDailyFocus?: boolean;
  includeCoachCard?: boolean;
}

export function HomeDailyCards({ onStartSession, includeDailyFocus = true, includeCoachCard = true }: HomeDailyCardsProps): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  return (
    <>
      {includeDailyFocus ? (
        <Pressable accessibilityHint="Resume your project session" accessibilityLabel="Daily focus card" accessibilityRole="button" onPress={onStartSession} style={({ pressed }) => ({ marginBottom: theme.spacing[4], opacity: pressed ? 0.84 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
          <VexSurface tone="hero" style={{ padding: theme.spacing[5] }}>
            <Text color={theme.colors.primary[500]} variant="label">Daily focus</Text>
            <Text variant="h2" style={{ marginTop: theme.spacing[3] }}>Start one clean block.</Text>
            <Text color="text.secondary" variant="bodyLarge" style={{ marginTop: theme.spacing[2] }}>VEX keeps the next move saved. No dashboard loop.</Text>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing[5] }}>
              <View style={{ gap: theme.spacing[1] }}><Text color="text.tertiary" variant="caption">First contract</Text><Text variant="body">30 minutes, one clean start.</Text></View>
              <LiquidButton accessibilityHint="Resume your project session" accessibilityLabel="Resume project" label="Resume" onPress={onStartSession} rightIcon={<Icon color={theme.colors.text.inverse} name="arrowRight" size="sm" />} size="sm" variant="primary" />
            </View>
          </VexSurface>
        </Pressable>
      ) : null}
      {includeCoachCard ? (
        <Pressable accessibilityHint="Open the AI coach" accessibilityLabel="AI Coach card" accessibilityRole="button" onPress={() => navigation.navigate('AICoach')} style={({ pressed }) => ({ opacity: pressed ? 0.84 : 1 })}>
          <VexSurface tone="quiet" style={{ padding: theme.spacing[4] }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}><View style={{ flex: 1, gap: theme.spacing[1] }}><Text variant="h4">AI Coach</Text><Text color="text.secondary" variant="bodySmall">You built real momentum. Protect this block.</Text></View><Text style={{ color: theme.colors.primary[500], fontSize: theme.typography.heading.h4.fontSize }}>→</Text></View>
          </VexSurface>
        </Pressable>
      ) : null}
    </>
  );
}
