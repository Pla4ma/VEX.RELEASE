/**
 * FocusControls — pause/resume + end/abandon actions for the active session.
 */
import React from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '../../../icons/components/Icon';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { borderRadius } from '../../../theme/tokens/radius';
import { spacing } from '../../../theme/tokens/spacing';
import { vexFire } from '../../../theme/tokens/vex-fire';

interface FocusControlsProps {
  isPaused: boolean;
  onPauseResume: () => void;
  onEnd: () => void;
}

export function FocusControls({
  isPaused,
  onPauseResume,
  onEnd,
}: FocusControlsProps): React.JSX.Element {
  return (
    <View
      style={{
        alignItems: 'stretch',
        gap: spacing[3],
        paddingHorizontal: spacing[2],
        width: '100%',
      }}
    >
      <LiquidButton
        accessibilityHint={
          isPaused
            ? 'Resumes the active focus block'
            : 'Pauses the active focus block'
        }
        accessibilityLabel={isPaused ? 'Resume focus' : 'Pause focus'}
        fullWidth
        label={isPaused ? 'Resume' : 'Pause'}
        leftIcon={
          <Icon
            color={vexFire.background}
            name={isPaused ? 'play' : 'pause'}
            size={18}
          />
        }
        onPress={onPauseResume}
        size="lg"
        variant="primary"
      />
      <Pressable
        accessibilityHint="Ends this session early"
        accessibilityLabel="End focus session"
        accessibilityRole="button"
        onPress={onEnd}
        style={({ pressed }) => ({
          alignItems: 'center',
            backgroundColor: pressed ? vexFire.panel : vexFire.panelSoft,
          borderColor: vexFire.borderStrong,
          borderRadius: borderRadius.full,
          borderWidth: 1,
          paddingVertical: 14,
        })}
      >
        <Text
          style={{
            color: vexFire.textSecondary,
            fontSize: 14,
            fontWeight: '700',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          End session
        </Text>
      </Pressable>
    </View>
  );
}
