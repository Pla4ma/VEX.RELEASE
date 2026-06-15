import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
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
                boxShadow: '0px 2px 6px active ? vexLightGlass.mint[300] : 'transparent' / active ? 0.50 : 0',
                width: 24,
              }}
            >
              {active ? (
                <Icon
                  color="#0C765F"
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
                fontSize: 10,
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

export default DayCheckRow;
