import React from 'react';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

export function CharacterCounter({
  current,
  max,
}: {
  current: number;
  max: number;
}): React.ReactNode {
  const { theme: _theme } = useTheme();
  const isNearLimit = current >= max - 3;

  return (
    <Text
      variant="caption"
      color={isNearLimit ? 'warning.DEFAULT' : 'text.tertiary'}
      fontWeight={isNearLimit ? '600' : '400'}
    >
      {current}/{max}
    </Text>
  );
}
