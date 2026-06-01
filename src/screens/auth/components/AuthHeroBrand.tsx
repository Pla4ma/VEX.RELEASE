import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { VexFocusMark } from './VexFocusMark';

interface AuthHeroBrandProps {
  label?: string;
  title?: string;
  tagline?: string;
}

export function AuthHeroBrand({
  label,
  title = 'VEX',
  tagline = 'Protect one block. Leave with proof.',
}: AuthHeroBrandProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const entering = isReducedMotion
    ? undefined
    : FadeInDown.duration(420).delay(0);

  return (
    <Animated.View
      entering={entering}
      style={{ alignItems: 'center', gap: theme.spacing[3] }}
    >
      {label ? (
        <Text
          color="vexCyan"
          textAlign="center"
          variant="label"
          letterSpacing={1.5}
        >
          {label.toUpperCase()}
        </Text>
      ) : null}
      <VexFocusMark size={64} />
      <Text
        color="text.primary"
        textAlign="center"
        variant="display"
        letterSpacing={2}
      >
        {title}
      </Text>
      <View
        style={{
          width: 32,
          height: 2,
          backgroundColor: theme.colors.semantic.vexCyan,
          borderRadius: 1,
          marginTop: theme.spacing[2],
          marginBottom: theme.spacing[1],
        }}
      />
      <Text
        color="text.secondary"
        textAlign="center"
        variant="body"
        style={{ maxWidth: 280 }}
      >
        {tagline}
      </Text>
    </Animated.View>
  );
}

export default AuthHeroBrand;
