import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { UI_TEXT } from '../constants';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';

export function ContentInputHeader(): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text color={vexFire.amber} variant="label">AI study lab</Text>
      <Text color={vexFire.cream} variant="h1">{UI_TEXT.INPUT_TITLE}</Text>
      <Text color={vexFire.textSecondary} variant="body">
        {UI_TEXT.INPUT_SUBTITLE}
      </Text>
    </View>
  );
}
