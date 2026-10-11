/**
 * FocusHeader — top bar for the active focus session.
 * Shows the back/abandon button, the block label, and the projected end time.
 */
import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { vexFire } from '../../../theme/tokens/vex-fire';

interface FocusHeaderProps {
  endTime: string | null;
  onAbandon: () => void;
}

export function FocusHeader({
  endTime,
  onAbandon,
}: FocusHeaderProps): React.JSX.Element {
  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <Pressable
        accessibilityHint="Shows the abandon confirmation"
        accessibilityLabel="Abandon session"
        accessibilityRole="button"
        hitSlop={12}
        onPress={onAbandon}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          paddingVertical: 8,
          paddingHorizontal: 12,
        })}
      >
        <Text
          style={{
            color: vexFire.textMuted,
            fontSize: 14,
            fontWeight: '700',
            letterSpacing: 0.5,
          }}
        >
          ← End
        </Text>
      </Pressable>
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            color: vexFire.textMuted,
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Focus block
        </Text>
        {endTime ? (
          <Text
            style={{
              color: vexFire.textSecondary,
              fontSize: 13,
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            ends at {endTime}
          </Text>
        ) : null}
      </View>
      <View style={{ width: 60 }} />
    </View>
  );
}
