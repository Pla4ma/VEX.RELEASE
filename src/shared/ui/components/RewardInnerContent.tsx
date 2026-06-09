import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';

interface RewardInnerContentProps {
  displayIcon: string;
  displayColor: string;
  displayLabel: string;
  amountText: string | null;
  description?: string;
  spacing: Record<string, number>;
  textColors: { primary: string; secondary: string };
}

export function RewardInnerContent({
  displayIcon,
  displayColor,
  displayLabel,
  amountText,
  description,
  spacing,
  textColors,
}: RewardInnerContentProps): JSX.Element {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], flex: 1 }}>
      <View style={{
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: `${displayColor}20`,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text fontSize={20}>{displayIcon}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
          <Text variant="bodySmall" color={textColors.primary} style={{ fontWeight: '700' }}>
            {displayLabel}
          </Text>
          {amountText && (
            <Text variant="bodySmall" color={displayColor} style={{ fontWeight: '800' }}>
              {amountText}
            </Text>
          )}
        </View>
        {description && (
          <Text variant="caption" color={textColors.secondary}>{description}</Text>
        )}
      </View>
    </View>
  );
}
