import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { SafeBlurView } from './SafeBlurView';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

type VexGlassInputProps = {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address';
  autoComplete?: 'email' | 'password';
  returnKeyType?: 'next' | 'done';
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
};

const FOCUS_MS = 280;
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

  const focusProgress = useSharedValue(0);

  React.useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, { duration: FOCUS_MS });
  }, [isFocused, focusProgress]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: isFocused ? 0.35 : 0,
    shadowRadius: isFocused ? 18 : 0,
    shadowColor: isFocused ? '#FF8A3D' : 'transparent',
    shadowOffset: { width: 0, height: isFocused ? 4 : 0 },
  }));

  const borderColor = error
    ? '#F87171'
    : isFocused
      ? 'rgba(166, 107, 255, 0.70)'
      : 'rgba(255, 255, 255, 0.06)';

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text
        color="semantic.liquidTextMuted"
        fontSize={12}
        fontWeight="600"
        letterSpacing={0.15}
      >
        {label}
      </Text>

      <Animated.View style={[glowStyle]}>
        {/* Gradient rim on focus */}
        {isFocused && (
          <LinearGradient
            colors={['rgba(166, 107, 255, 0.55)', 'rgba(255, 138, 61, 0.25)']}
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
              colors={['rgba(0, 0, 0, 0.20)', 'rgba(0, 0, 0, 0)']}
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
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
              placeholderTextColor="rgba(247, 245, 255, 0.20)"
              returnKeyType={returnKeyType ?? (secureTextEntry ? 'done' : 'next')}
              secureTextEntry={secureTextEntry}
              style={{
                minHeight: 54,
                color: '#F7F5FF',
                fontSize: 16,
                paddingHorizontal: theme.spacing[4],
              }}
              value={value}
            />
          </SafeBlurView>
        </View>
      </Animated.View>

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
