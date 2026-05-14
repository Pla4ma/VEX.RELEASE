/**
 * PremiumGate
 *
 * Shows upgrade prompt for locked premium features.
 * Used when a user tries to access a premium-only feature.
 *
 * Dependencies: shared/monetization
 * Consumers: ai-coach, boss, inventory features
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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

// ============================================================================
// Types
// ============================================================================

export type PremiumGateFeature = 'ai_coach_full_access' | 'ai_coach_persona_drill_sergeant' | 'boss_tier_4' | 'boss_tier_5' | 'boss_tier_6' | 'inventory_expansion' | 'advanced_analytics' | 'content_study' | 'custom_themes' | 'squad_challenges';

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

// ============================================================================
// Feature Gate Definitions
// ============================================================================

const FEATURE_GATE_MAP: Record<PremiumGateFeature, FeatureGateInfo> = {
  ai_coach_full_access: {
    title: 'Unlock the Full AI Coach',
    description: 'Premium unlocks the strongest coaching layer: sharper timing, better nudges, and recommendations that actually fit your rhythm.',
    unlocks: ['Personalized session timing', 'Smart nudges and reminders', 'Pattern-based recommendations', 'All 3 coach personas'],
    icon: '🧠',
    gradient: ['#4F46E5', '#7C3AED'],
  },
  ai_coach_persona_drill_sergeant: {
    title: 'Unlock the Drill Sergeant',
    description: 'The Drill Sergeant persona is only available with Premium. Get intense, zero-tolerance coaching when you need maximum accountability.',
    unlocks: ['Drill Sergeant persona', 'Zero-tolerance mode', 'Maximum accountability'],
    icon: '💀',
    gradient: ['#DC2626', '#991B1B'],
  },
  boss_tier_4: {
    title: 'Unlock Boss Tier 4',
    description: 'The Perfectionist boss awaits Premium users. Defeat it to unlock Tier 5 and the ultimate challenge.',
    unlocks: ['The Perfectionist boss', 'Tier 4 rewards', 'Path to Tier 5'],
    icon: '🐉',
    gradient: ['#059669', '#10B981'],
  },
  boss_tier_5: {
    title: 'Unlock Boss Tier 5',
    description: 'Master of Multitasking is a Premium-only boss. Can you focus long enough to defeat it?',
    unlocks: ['Master of Multitasking boss', 'Tier 5 rewards', 'Path to Tier 6'],
    icon: '👹',
    gradient: ['#7C2D12', '#9A3412'],
  },
  boss_tier_6: {
    title: 'Unlock the Final Boss',
    description: 'Burnout Beast is the ultimate squad boss raid, exclusively for Premium users who have conquered all before it.',
    unlocks: ['Burnout Beast raid boss', 'Legendary rewards', 'Squad raid mode'],
    icon: '🔥',
    gradient: ['#1E1B4B', '#312E81'],
  },
  inventory_expansion: {
    title: 'Expand Your Inventory',
    description: 'Premium unlocks 500 inventory slots so you can collect every cosmetic, ingredient, and legendary item.',
    unlocks: ['500 inventory slots', 'More storage space', 'Collect everything'],
    icon: '🎒',
    gradient: ['#D97706', '#F59E0B'],
  },
  advanced_analytics: {
    title: 'Unlock Advanced Analytics',
    description: 'Premium gives you deeper insights into when you focus best and where your momentum starts leaking.',
    unlocks: ['Focus pattern analysis', 'Productivity insights', 'Trend reports'],
    icon: '📊',
    gradient: ['#0F766E', '#0D9488'],
  },
  content_study: {
    title: 'Unlock Content Study',
    description: 'Premium expands VEX into a deeper work tool once your focus habit is already taking hold.',
    unlocks: ['Study session mode', 'Content focus tracking', 'Learning analytics'],
    icon: '📚',
    gradient: ['#BE185D', '#DB2777'],
  },
  custom_themes: {
    title: 'Unlock Custom Themes',
    description: 'Premium lets you personalize VEX with exclusive themes and accent colors.',
    unlocks: ['Exclusive themes', 'Custom accent colors', 'Premium backgrounds'],
    icon: '🎨',
    gradient: ['#4338CA', '#6366F1'],
  },
  squad_challenges: {
    title: 'Unlock Squad Challenges',
    description: 'Premium unlocks advanced squad challenge modes for competitive focus with your team.',
    unlocks: ['Advanced challenges', 'Squad competitions', 'Team leaderboards'],
    icon: '🏆',
    gradient: ['#047857', '#059669'],
  },
};

// ============================================================================
// Component
// ============================================================================

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

export function PremiumGate({ feature, description, onClose, showCloseButton = true }: PremiumGateProps): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const featureInfo = FEATURE_GATE_MAP[feature];

  const handleUpgrade = () => {
    navigation.navigate('Paywall', {
      source: `premium_gate_${feature}`,
      gatedFeature: feature,
    });
  };

  return (
    <Animated.View entering={FadeInUp.duration(300)} style={styles.container}>
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
        <Text style={[styles.unlocksTitle, { color: theme.colors.text.primary }]}>Premium unlocks:</Text>
        {featureInfo.unlocks.map((unlock, index) => (
          <View key={index} style={styles.unlockRow}>
            <Icon name="check-circle" size={16} color={theme.colors.success[500]} style={styles.checkIcon} />
            <Text style={[styles.unlockText, { color: theme.colors.text.secondary }]}>{unlock}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button variant="primary" size="lg" onPress={handleUpgrade} accessibilityLabel="Upgrade to Premium button" accessibilityRole="button" accessibilityHint="Activates this control">
          Upgrade to Premium
        </Button>

        {showCloseButton && onClose && (
          <Button variant="ghost" size="sm" onPress={onClose} accessibilityLabel="Maybe later button" accessibilityRole="button" accessibilityHint="Activates this control">
            Maybe later
          </Button>
        )}
      </View>

      <Pressable style={styles.earnOption} onPress={handleUpgrade} accessibilityLabel="Or earn Premium free through achievements → button" accessibilityRole="button" accessibilityHint="Activates this control">
        <Text style={[styles.earnText, { color: theme.colors.text.tertiary }]}>Or earn Premium free through achievements →</Text>
      </Pressable>
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    margin: 16,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
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
  unlocksTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  unlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIcon: {
    marginTop: 1,
  },
  unlockText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 12,
  },
  earnOption: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    alignItems: 'center',
  },
  earnText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default PremiumGate;
