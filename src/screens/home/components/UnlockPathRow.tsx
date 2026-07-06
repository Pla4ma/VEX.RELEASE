import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { borderRadius } from '../../../theme/tokens/radius';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

import type { HomeUnlockPathItem } from '../services/home-unlock-path-schemas';

function formatPoints(value: number): string {
  return (Math.round(value * 10) / 10).toString();
}

interface UnlockPathRowProps {
  item: HomeUnlockPathItem;
  isNext: boolean;
  onPeek?: (item: HomeUnlockPathItem) => void;
}

export function UnlockPathRow({
  item,
  isNext,
  onPeek,
}: UnlockPathRowProps): React.ReactNode {
  const progress = Math.min(1, item.current / item.requirement);

  if (item.isUnlocked) {
    return (
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: spacing[3],
          opacity: 0.9,
          paddingVertical: spacing[2],
        }}
      >
        <View
          style={{
            alignItems: 'center',
            backgroundColor: vexLightGlass.mint[100],
            borderRadius: borderRadius.full,
            height: 40,
            justifyContent: 'center',
            width: 40,
          }}
        >
          <Icon color={vexLightGlass.mint[800]} name="check" size="sm" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 15,
              fontWeight: '700',
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.tertiary,
              fontSize: 12,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {item.reward}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityHint={`Locked. ${formatPoints(Math.max(0, item.requirement - item.current))} points away`}
      accessibilityLabel={`${item.title} - locked`}
      accessibilityRole="button"
      onPress={() => onPeek?.(item)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        paddingVertical: spacing[2],
      })}
    >
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing[3] }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: isNext ? vexLightGlass.mint[200] : vexLightGlass.mint[50],
            borderRadius: borderRadius.full,
            height: 40,
            justifyContent: 'center',
            width: 40,
          }}
        >
          <Icon
            color={isNext ? vexLightGlass.mint[800] : vexLightGlass.text.tertiary}
            name={isNext ? 'sparkles' : 'lock'}
            size="sm"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 15,
              fontWeight: isNext ? '800' : '600',
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.tertiary,
              fontSize: 12,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {item.eyebrow} · {item.reward}
          </Text>
        </View>
      </View>
      {isNext && (
        <View
          style={{
            backgroundColor: vexLightGlass.glass.borderSubtle,
            borderRadius: borderRadius.full,
            height: 4,
            marginTop: spacing[2],
            marginLeft: 52,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: vexLightGlass.mint[500],
              borderRadius: borderRadius.full,
              height: '100%',
              width: `${progress * 100}%`,
            }}
          />
        </View>
      )}
    </Pressable>
  );
}
