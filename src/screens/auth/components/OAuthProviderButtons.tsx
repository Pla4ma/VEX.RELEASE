import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import type { AuthOAuthProvider } from '../../../features/auth/types';

interface ProviderButtonProps {
  label: string;
  mark: string;
  onPress: () => void;
  variant: 'dark' | 'light';
  disabled: boolean;
}

function ProviderButton({
  disabled,
  label,
  mark,
  onPress,
  variant,
}: ProviderButtonProps): React.JSX.Element {
  const { theme } = useTheme();
  const isDark = variant === 'dark';

  return (
    <Pressable
      accessibilityHint={`Starts ${label.toLowerCase()} using Supabase auth`}
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        ...getMinTouchTargetStyle(),
        alignItems: 'center',
        backgroundColor: isDark
          ? theme.colors.semantic.obsidian
          : theme.colors.semantic.liquidPanel,
        borderColor: isDark
          ? theme.colors.semantic.liquidGlassBorder
          : theme.colors.semantic.border,
        borderRadius: theme.borderRadius['2xl'],
        borderWidth: theme.spacing[0] + 1,
        flexDirection: 'row',
        gap: theme.spacing[3],
        justifyContent: 'center',
        minHeight: theme.spacing[12] + theme.spacing[2],
        opacity: disabled
          ? theme.opacity[80]
          : pressed
            ? theme.opacity[90]
            : theme.opacity[100],
        paddingHorizontal: theme.spacing[5],
      })}
    >
      <Text
        color={isDark ? 'semantic.liquidText' : 'semantic.textPrimary'}
        fontSize={20}
        fontWeight="800"
      >
        {mark}
      </Text>
      <Text
        color={isDark ? 'semantic.liquidText' : 'semantic.textPrimary'}
        fontSize={16}
        fontWeight="800"
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function OAuthProviderButtons({
  disabled,
  onProviderPress,
}: {
  disabled: boolean;
  onProviderPress: (provider: AuthOAuthProvider) => void;
}): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.spacing[3] }}>
      <ProviderButton
        disabled={disabled}
        label="Continue with Google"
        mark="G"
        onPress={() => onProviderPress('google')}
        variant="dark"
      />
      <ProviderButton
        disabled={disabled}
        label="Continue with Apple"
        mark="A"
        onPress={() => onProviderPress('apple')}
        variant="light"
      />
    </View>
  );
}
