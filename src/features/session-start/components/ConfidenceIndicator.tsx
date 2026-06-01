import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';


type Confidence = 'low' | 'medium' | 'high';

interface ConfidenceIndicatorProps {
  confidence: Confidence;
}

export function ConfidenceIndicator({
  confidence,
}: ConfidenceIndicatorProps): JSX.Element {
  const { theme } = useTheme();

  const barWidth = confidence === 'high' ? '100%' : confidence === 'medium' ? '60%' : '30%';
  const barColor =
    confidence === 'high'
      ? theme.colors.success.DEFAULT
      : confidence === 'medium'
        ? theme.colors.warning.DEFAULT
        : theme.colors.text.secondary;

  return (
    <View
      style={{
        marginTop: theme.spacing[2],
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text
        variant="caption"
        style={{ color: theme.colors.text.secondary }}
      >
        Confidence:{' '}
        {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
      </Text>
      <View
        style={{
          marginLeft: theme.spacing[2],
          width: 60,
          height: 4,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: barWidth,
            height: '100%',
            backgroundColor: barColor,
          }}
        />
      </View>
    </View>
  );
}
