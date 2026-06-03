import React, { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

type VexGlassFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address';
  autoComplete?: 'email' | 'password';
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
};

export function VexGlassField({
  label,
  value,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoComplete,
  onChangeText,
  onSubmitEditing,
}: VexGlassFieldProps): React.JSX.Element {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = error
    ? semantic.danger
    : isFocused
      ? semantic.liquidAmber
      : semantic.liquidInputBorder;

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text color="semantic.liquidTextSoft" fontSize={12} fontWeight="800" letterSpacing={0.8}>
        {label}
      </Text>
      <View
        style={{
          borderRadius: theme.borderRadius['2xl'],
          borderWidth: 1,
          borderColor,
          backgroundColor: semantic.liquidInput,
          shadowColor: isFocused ? semantic.liquidOrange : semantic.liquidShadow,
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: isFocused ? 0.28 : 0.18,
          shadowRadius: isFocused ? 30 : 18,
        }}
      >
        <TextInput
          accessibilityHint={`Enter your VEX ${label.toLowerCase()}`}
          accessibilityLabel={label}
          autoCapitalize="none"
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={semantic.liquidTextMuted}
          returnKeyType={secureTextEntry ? 'done' : 'next'}
          secureTextEntry={secureTextEntry}
          style={{
            minHeight: 56,
            color: semantic.liquidText,
            fontSize: 16,
            paddingHorizontal: theme.spacing[4],
          }}
          value={value}
        />
      </View>
      <Text color={error ? 'semantic.danger' : 'semantic.liquidGlassClear'} fontSize={12} lineHeight={18}>
        {error ?? ' '}
      </Text>
    </View>
  );
}

