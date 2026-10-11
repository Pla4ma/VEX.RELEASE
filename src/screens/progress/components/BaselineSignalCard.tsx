import React, { useCallback } from 'react';
import { View } from 'react-native';

import { GlassCard } from '../../../components/glass/GlassCard';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { useOnboardingStore } from '../../../features/onboarding/store';
import { GOAL_OPTIONS } from '../../../features/onboarding/service';
import type { FocusGoal } from '../../../features/onboarding/schemas';
import { useUIStore } from '../../../store';
import { buttonTap } from '../../../utils/haptics';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { GoalChip } from './GoalChip';


          
const GOAL_ICONS: Record<FocusGoal, string> = {
  WORK: 'target',
  STUDY: 'book',
  CREATIVE: 'sparkles',
  PERSONAL: 'heart',
};

export function BaselineSignalCard(): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const goal = useOnboardingStore((state) => state.goal);
  const setGoal = useOnboardingStore((state) => state.setGoal);
  const showToast = useUIStore((state) => state.showToast);

  const handleSelect = useCallback(
    (next: FocusGoal) => {
      buttonTap();
      setGoal(next);
      const label = GOAL_OPTIONS.find((g) => g.key === next)?.label ?? next;
      showToast({ message: `Baseline set: ${label}`, type: 'success' });
    },
    [setGoal, showToast],
  );

  return (
    <GlassCard accessibilityLabel="Baseline signal card" glowMint variant="default">
      <View style={{ gap: theme.spacing[3] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: vexFire.backgroundSoft,
              borderRadius: theme.borderRadius.full,
              height: 28,
              justifyContent: 'center',
              width: 28,
            }}
          >
            <Icon color={vexFire.ember} name="target" size="sm" />
          </View>
          <Text color="primary.500" variant="label">Day 0 signal</Text>
        </View>
        <Text variant="h2">Reveal your baseline</Text>
        <Text color="text.secondary" variant="body">
          Pick what your first session is for. This becomes your first progressive signal and shapes what VEX unlocks next.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
          {GOAL_OPTIONS.map((option) => (
            <GoalChip
              key={option.key}
              icon={GOAL_ICONS[option.key]}
              isReducedMotion={isReducedMotion}
              isSelected={goal === option.key}
              label={option.label}
              onPress={() => handleSelect(option.key)}
            />
          ))}
        </View>
        {goal ? (
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[2] }}>
            <Icon color={vexFire.ember} name="check-circle" size="sm" />
            <Text color="primary.700" variant="bodySmall">
              {GOAL_OPTIONS.find((g) => g.key === goal)?.description}
            </Text>
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}
