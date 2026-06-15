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
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { GoalChip } from './GoalChip';

const GOAL_ICONS: Record<FocusGoal, string> = {
  WORK: 'target',
  STUDY: 'book',
  CREATIVE: 'sparkles',
  PERSONAL: 'heart',
};

export function BaselineSignalCard(): React.ReactNode {
  const { isReducedMotion } = useReducedMotion();
  const goal = useOnboardingStore((state) => state.goal);
  const setGoal = useOnboardingStore((state) => state.setGoal);
  const showToast = useUIStore((state) => state.showToast);

  const handleSelect = useCallback(
    (next: FocusGoal) => {
      buttonTap();
      setGoal(next);
      const label = GOAL_OPTIONS.find((g) => g.key === next)?.label ?? next;
      showToast({
        message: `Baseline set: ${label}`,
        type: 'success',
      });
    },
    [setGoal, showToast],
  );

  return (
    <GlassCard
      accessibilityLabel="Baseline signal card"
      glowMint
      variant="default"
    >
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: vexLightGlass.mint[100],
              borderRadius: 999,
              height: 28,
              justifyContent: 'center',
              width: 28,
            }}
          >
            <Icon color={vexLightGlass.mint[700]} name="target" size="sm" />
          </View>
          <Text
            style={{
              color: vexLightGlass.mint[700],
              fontSize: 12,
              fontWeight: '800',
              letterSpacing: 1.5,
            }}
          >
            DAY 0 SIGNAL
          </Text>
        </View>

        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 22,
            fontWeight: '700',
            letterSpacing: -0.5,
          }}
        >
          Reveal your baseline
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 20,
          }}
        >
          Pick what your first session is for. This becomes your first
          progressive signal and shapes what VEX unlocks next.
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 4,
          }}
        >
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
          <View
            style={{
              alignItems: 'center',
              backgroundColor: vexLightGlass.mint[50],
              borderColor: vexLightGlass.mint[200],
              borderRadius: 16,
              borderWidth: 1,
              flexDirection: 'row',
              gap: 8,
              marginTop: 4,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Icon
              color={vexLightGlass.mint[700]}
              name="check-circle"
              size="sm"
            />
            <Text
              style={{
                color: vexLightGlass.mint[800],
                fontSize: 13,
                fontWeight: '600',
              }}
            >
              {GOAL_OPTIONS.find((g) => g.key === goal)?.description}
            </Text>
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}
