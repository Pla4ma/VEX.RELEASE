import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

interface DayCheckRowProps {
  currentDays: number;
}

export function DayCheckRow({ currentDays }: DayCheckRowProps): React.ReactNode {
  const daysToShow = Math.min(currentDays, 7);
  const showFullWeek = currentDays >= 7;
  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
        marginTop: 14,
      }}
    >
      {DAY_LABELS.map((label, index) => {
        const active = showFullWeek || index < daysToShow;
        return (
          <View
            key={`${label}-${index}`}
            style={{ alignItems: 'center', flex: 1, gap: 5 }}
          >
            <View
              style={{
                alignItems: 'center',
                backgroundColor: active
                  ? 'rgba(95, 230, 197, 0.38)'
                  : 'rgba(16, 35, 31, 0.04)',
                borderColor: active
                  ? 'rgba(66, 207, 174, 0.75)'
                  : 'rgba(16, 35, 31, 0.08)',
                borderRadius: 999,
                borderWidth: 1.2,
                height: 24,
                justifyContent: 'center',
                boxShadow: active ? '0px 2px 6px ' + vexLightGlass.mint[300] : '0px 2px 6px transparent',
                width: 24,
              }}
            >
              {active ? (
                <Icon
                  color={vexLightGlass.mint[700]}
                  name="check"
                  size="xs"
                  variant="solid"
                />
              ) : null}
            </View>
            <Text
              style={{
                color: active
                  ? vexLightGlass.mint[700]
                  : vexLightGlass.text.tertiary,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export { DayCheckRow }