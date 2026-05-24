import React from 'react';
import { Pressable, View } from 'react-native';
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

interface FeatureGateInfo {
  title: string;
  description: string;
  unlocks: string[];
  icon: string;
  gradient: readonly [string, string];
}

const FEATURE_GATE_MAP: Record<PremiumGateFeature, FeatureGateInfo> = {
  deep_coach_memory: {
    title: 'Unlock Deep Coach Memory',
    description:
      'VEX learns your patterns, best focus windows, comeback style, and preferred push intensity — then adapts every session to you.',
    unlocks: [
      'Pattern-based session timing',
      'Comeback style memory',
      'Best focus window detection',
      'Adaptive push intensity',
    ],
    icon: '\uD83E\uDDE0',
    gradient: [launchColors.hex_4f46e5, launchColors.hex_7c3aed],
  },
  progress_intelligence: {
    title: 'Unlock Progress Intelligence',
    description:
      'See your rhythm, focus risk, recovery plans, and consistency forecasts — not just streaks.',
    unlocks: [
      'Weekly execution report',
      'Focus risk detection',
      'Recovery planning',
      'Consistency forecasting',
    ],
    icon: '\uD83D\uDCCA',
    gradient: [launchColors.hex_0f766e, launchColors.hex_0d9488],
  },
  advanced_study_os: {
    title: 'Unlock Advanced Study / Deep Work',
    description:
      'Turn sessions into review loops, project breakdowns, quizzes, and smart next actions from your own content.',
    unlocks: [
      'Content-based session generation',
      'Review loops and quizzes',
      'Project breakdowns',
      'Smart next-action engine',
    ],
    icon: '\uD83D\uDCD6',
    gradient: [launchColors.hex_d97706, launchColors.hex_f59e0b],
  },
  premium_session_modes: {
    title: 'Unlock Premium Session Modes',
    description:
      'Exam Sprint, Deep Work, Calm Reset, Comeback Mode, and Review Mode — deeper tools when the basic loop works.',
    unlocks: [
      'Exam Sprint mode',
      'Calm Reset mode',
      'Comeback Mode',
      'Review Mode',
    ],
    icon: '\u26A1',
    gradient: [launchColors.hex_4f46e5, launchColors.hex_7c3aed],
  },
  visual_identity: {
    title: 'Unlock Visual Identity',
    description:
      'Shape companion forms, focus worlds, session atmospheres, and premium animations without changing core progress.',
    unlocks: [
      'Companion form customization',
      'Focus world themes',
      'Session atmospheres',
      'Premium animations',
    ],
    icon: '\u2728',
    gradient: [launchColors.hex_0f766e, launchColors.hex_0d9488],
  },
  recovery_planning: {
    title: 'Unlock Recovery Planning',
    description:
      'Build a recovery plan that helps you return without shame or backlog pressure after missed sessions.',
    unlocks: [
      'Personalized recovery path',
      'Gentle return scheduling',
      'Backlog-free restart',
      'Progress preservation',
    ],
    icon: '\uD83D\uDEE1\uFE0F',
    gradient: [launchColors.hex_059669, launchColors.hex_10b981],
  },
};

export function PremiumGate({
  feature,
  description,
  onClose,
  showCloseButton = true,
}: PremiumGateProps) {
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const { theme } = useTheme();
  const featureInfo = FEATURE_GATE_MAP[feature];

  function handleUpgrade() {
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
        <Text style={styles.description}>
          {description ?? featureInfo.description}
        </Text>
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
        {featureInfo.unlocks.map((unlock, index) => (
          <View key={index} style={styles.unlockRow}>
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
          accessibilityLabel="Upgrade to Premium button"
          accessibilityRole="button"
          accessibilityHint="Opens the premium upgrade screen"
        >
          See Premium
        </Button>

        {showCloseButton && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onPress={onClose}
            accessibilityLabel="Maybe later button"
            accessibilityRole="button"
            accessibilityHint="Dismisses the premium gate"
          >
            Maybe later
          </Button>
        )}
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
