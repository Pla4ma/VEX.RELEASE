import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SafeBlurView } from './SafeBlurView';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { lightColors } from '@/theme/tokens/colors';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

type VexGlassInputProps = {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address';
  autoComplete?: 'email' | 'password' | 'current-password';
  returnKeyType?: 'next' | 'done';
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
};

const R = '2xl' as const;

export function VexGlassInput({
  label,
  value,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoComplete,
  returnKeyType,
  onChangeText,
  onSubmitEditing,
}: VexGlassInputProps): React.JSX.Element {
  const { theme } = useTheme();
  const r = theme.borderRadius[R];
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? lightColors.error.light
    : isFocused
      ? rgbaColors.rgb_166_107_255_0_7
      : rgbaColors.rgb_255_255_255_0_06;

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text
        color="semantic.liquidTextMuted"
        fontSize={13}
        fontWeight="700"
        letterSpacing={0.15}
        style={{ color: 'rgba(9,42,39,0.72)' }}
      >
        {label}
      </Text>

      <View>
        {/* Gradient rim on focus */}
        {isFocused && (
          <LinearGradient
            colors={[rgbaColors.rgb_166_107_255_0_55, rgbaColors.rgb_255_138_61_0_25]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: -1,
              left: -1,
              right: -1,
              bottom: -1,
              borderRadius: r + 1,
            }}
          />
        )}

        {/* Smoked glass capsule */}
        <View
          style={{
            borderRadius: r,
            overflow: 'hidden',
            margin: isFocused ? 1 : 0,
            borderWidth: error ? 1 : isFocused ? 0 : 1,
            borderColor,
          }}
        >
          <SafeBlurView intensity={12} tint="dark" style={{ borderRadius: r, overflow: 'hidden' }}>
            {/* Inner shadow — top */}
            <LinearGradient
              colors={[rgbaColors.rgb_0_0_0_0_2, rgbaColors.rgb_0_0_0_0]}
              locations={[0, 0.2]}
              pointerEvents="none"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 20 }}
            />

            {/* Specular rim — top */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 16,
                right: 16,
                height: 0.5,
                backgroundColor: rgbaColors.rgb_255_255_255_0_06,
              }}
            />

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
              placeholderTextColor={'rgba(143,160,156,0.85)'}
              returnKeyType={returnKeyType ?? (secureTextEntry ? 'done' : 'next')}
              secureTextEntry={secureTextEntry}
              style={{
                minHeight: 54,
                color: '#092A27',
                fontSize: 16,
                paddingHorizontal: theme.spacing[4],
              }}
              value={value}
            />
          </SafeBlurView>
        </View>
      </View>

      <Text
        color={error ? 'semantic.danger' : 'semantic.liquidGlassClear'}
        fontSize={12}
        lineHeight={18}
        style={{ opacity: error ? 1 : 0, minHeight: 18 }}
      >
        {error ?? ' '}
      </Text>
    </View>
  );
}
