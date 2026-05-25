import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { useTheme } from '../../../theme';
import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
import { getAvailabilityFor } from '../../liveops-config';

export type PremiumGateFeature =
  | 'deep_coach_memory'
  | 'progress_intelligence'
  | 'advanced_study_os'
  | 'premium_session_modes'
  | 'visual_identity'
  | 'recovery_planning';

export interface PremiumGateProps {
  feature: PremiumGateFeature;
  description?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

type FeatureGateInfo = {
  title: string;
  description: string;
  unlocks: string[];
  icon: string;
  gradient: readonly [string, string];
};

const FEATURE_GATE_MAP: Record<PremiumGateFeature, FeatureGateInfo> = {
  deep_coach_memory: gate('Unlock Deep Coach Memory', 'VEX remembers patterns, comeback style, best focus windows, and preferred push intensity.', ['Pattern-based session timing', 'Comeback style memory', 'Best focus window detection', 'Adaptive push intensity'], '\uD83E\uDDE0', [launchColors.hex_4f46e5, launchColors.hex_7c3aed]),
  progress_intelligence: gate('Unlock Progress Intelligence', 'See rhythm, focus risk, recovery plans, and consistency forecasts.', ['Weekly execution report', 'Focus risk detection', 'Recovery planning', 'Consistency forecasting'], '\uD83D\uDCCA', [launchColors.hex_0f766e, launchColors.hex_0d9488]),
  advanced_study_os: gate('Unlock Advanced Study / Deep Work', 'Turn sessions into review loops, project breakdowns, quizzes, and smart next actions.', ['Content-based session generation', 'Review loops and quizzes', 'Project breakdowns', 'Smart next-action engine'], '\uD83D\uDCD6', [launchColors.hex_d97706, launchColors.hex_f59e0b]),
  premium_session_modes: gate('Unlock Premium Session Modes', 'Exam Sprint, Deep Work, Calm Reset, Comeback Mode, and Review Mode.', ['Exam Sprint mode', 'Calm Reset mode', 'Comeback Mode', 'Review Mode'], '\u26A1', [launchColors.hex_4f46e5, launchColors.hex_7c3aed]),
  visual_identity: gate('Unlock Visual Identity', 'Shape companion forms, focus worlds, session atmospheres, and premium animations.', ['Companion form customization', 'Focus world themes', 'Session atmospheres', 'Premium animations'], '\u2728', [launchColors.hex_0f766e, launchColors.hex_0d9488]),
  recovery_planning: gate('Unlock Recovery Planning', 'Build a recovery plan that helps you return without shame or backlog pressure.', ['Personalized recovery path', 'Gentle return scheduling', 'Backlog-free restart', 'Progress preservation'], '\uD83D\uDEE1\uFE0F', [launchColors.hex_059669, launchColors.hex_10b981]),
};

function gate(
  title: string,
  description: string,
  unlocks: string[],
  icon: string,
  gradient: readonly [string, string],
): FeatureGateInfo {
  return { title, description, unlocks, icon, gradient };
}

export function PremiumGate({
  feature,
  description,
  onClose,
  showCloseButton = true,
}: PremiumGateProps): JSX.Element | null {
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const { theme } = useTheme();
  const featureInfo = FEATURE_GATE_MAP[feature];
  const premiumAvailability = getAvailabilityFor('premium_paywall');

  if (!premiumAvailability.canRenderEntryPoint) {
    return null;
  }

  function handleUpgrade(): void {
    if (!premiumAvailability.canNavigate) {
      return;
    }
    navigation.navigate('Paywall', {
      source: 'feature_gate',
      gatedFeature: feature,
    });
  }

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.container}>
      <LinearGradient colors={[...featureInfo.gradient]} style={styles.header}>
        <Text style={styles.icon}>{featureInfo.icon}</Text>
        <Text style={styles.title}>{featureInfo.title}</Text>
        <Text style={styles.description}>{description ?? featureInfo.description}</Text>
      </LinearGradient>

      <View
        style={[
          styles.unlocksSection,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.border.DEFAULT,
          },
        ]}
      >
        <Text style={[styles.unlocksTitle, { color: theme.colors.text.primary }]}>
          Premium unlocks:
        </Text>
        {featureInfo.unlocks.map((unlock) => (
          <View key={unlock} style={styles.unlockRow}>
            <Icon
              name="check-circle"
              size={16}
              color={theme.colors.success[500]}
              style={styles.checkIcon}
            />
            <Text style={[styles.unlockText, { color: theme.colors.text.secondary }]}>
              {unlock}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleUpgrade}
          accessibilityLabel="See Premium"
          accessibilityRole="button"
          accessibilityHint="Opens the premium screen only when billing is available"
        >
          See Premium
        </Button>

        {showCloseButton && onClose ? (
          <Button
            variant="ghost"
            size="sm"
            onPress={onClose}
            accessibilityLabel="Maybe later"
            accessibilityRole="button"
            accessibilityHint="Dismisses the premium gate"
          >
            Maybe later
          </Button>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = createSheet({
  container: { borderRadius: 24, overflow: 'hidden', margin: 16 },
  header: { padding: 24, alignItems: 'center', gap: 12 },
  icon: { fontSize: 48 },
  title: {
    color: launchColors.hex_ffffff,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: launchColors.rgb_255_255_255_0_9,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  unlocksSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    gap: 12,
  },
  unlocksTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  unlockRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkIcon: { marginTop: 1 },
  unlockText: { fontSize: 14, lineHeight: 20 },
  actions: { backgroundColor: launchColors.hex_ffffff, padding: 20, gap: 12 },
});

export default PremiumGate;
