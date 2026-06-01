import React from 'react';
import { View } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';

interface BossCombatHUDViewProps {
  phaseColor: string;
  healthPercent: number;
  currentPhase: 'CALM' | 'AGITATED' | 'ENRAGED' | 'DESPERATE';
  currentAttackPattern?: string | null;
  attackName: string;
  showToast: boolean;
  damageDealt: number;
  comboBonus: number;
  cooldownStyle: AnimatedStyle;
  isPaused: boolean;
  isOnCooldown: boolean;
  cooldownRemaining: number;
  abilityLabel: string;
  abilityIcon: string;
  onActivateAbility: () => void;
}

export function BossCombatHUDView({
  phaseColor,
  healthPercent,
  currentPhase,
  currentAttackPattern,
  attackName,
  showToast,
  damageDealt,
  comboBonus,
  cooldownStyle,
  isPaused,
  isOnCooldown,
  cooldownRemaining,
  abilityLabel,
  abilityIcon,
  onActivateAbility,
}: BossCombatHUDViewProps): JSX.Element {
  const { theme } = useTheme();
  return (
    <View
      style={{
        position: 'absolute',
        bottom: theme.spacing[8] + theme.spacing[10],
        left: theme.spacing[4],
        right: theme.spacing[4],
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: phaseColor,
        padding: theme.spacing[3],
        shadowColor: phaseColor,
        shadowOffset: { width: 0, height: theme.spacing[1] },
        shadowOpacity: 0.3,
        shadowRadius: theme.spacing[2],
        elevation: 8,
      }}
    >
      {showToast && (
        <View
          style={{
            position: 'absolute',
            top: -theme.spacing[10],
            left: 0,
            right: 0,
            backgroundColor: theme.colors.success.DEFAULT,
            paddingVertical: theme.spacing[2],
            paddingHorizontal: theme.spacing[3],
            borderRadius: theme.borderRadius.lg,
            alignItems: 'center',
          }}
        >
          <Text variant="bodySmall" color={theme.colors.text.inverse}>
            +{damageDealt} damage
            {comboBonus > 0 && ` (${Math.floor(comboBonus * 100)}% combo)`}
          </Text>
        </View>
      )}
      <View
        style={{
          height: theme.spacing[2],
          backgroundColor: theme.colors.background.tertiary,
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden',
          marginBottom: theme.spacing[2],
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${healthPercent}%`,
            backgroundColor: phaseColor,
            borderRadius: theme.borderRadius.full,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing[2],
        }}
      >
        <View
          style={{
            backgroundColor: phaseColor,
            paddingVertical: theme.spacing[1],
            paddingHorizontal: theme.spacing[2],
            borderRadius: theme.borderRadius.full,
          }}
        >
          <Text
            style={{
              color: theme.colors.text.inverse,
              fontWeight: '700',
              fontSize: theme.typography.ui.caption.fontSize ?? 12,
              textTransform: 'uppercase',
            }}
          >
            {currentPhase}
          </Text>
        </View>
        <Text variant="caption" color={theme.colors.text.secondary}>
          {Math.round(healthPercent)}% HP
        </Text>
      </View>
      {currentAttackPattern && (
        <View
          style={{
            backgroundColor: theme.colors.warning[50],
            padding: theme.spacing[2],
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing[2],
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.warning.DEFAULT,
          }}
        >
          <Text variant="bodySmall" color={theme.colors.warning.DEFAULT}>
            {attackName}
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Maintain focus to dodge.
          </Text>
        </View>
      )}
      <Animated.View
        style={[
          { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
          cooldownStyle,
        ]}
      >
        <Button
          variant="primary"
          size="md"
          onPress={onActivateAbility}
          disabled={isPaused || isOnCooldown}
          style={{ flex: 1 }}
          accessibilityLabel={`Activate ${abilityLabel}`}
          accessibilityRole="button"
          accessibilityHint="Uses the selected combat ability against the active boss"
        >
          {isOnCooldown
            ? `${cooldownRemaining}s`
            : `${abilityIcon} ${abilityLabel}`}
        </Button>
      </Animated.View>
    </View>
  );
}
