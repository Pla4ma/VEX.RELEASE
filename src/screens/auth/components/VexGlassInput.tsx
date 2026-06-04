import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { SafeBlurView } from './SafeBlurView';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { lightColors } from '@/theme/tokens/colors';

type VexGlassInputProps = {
  label: string; value: string; placeholder: string; error?: string;
  secureTextEntry?: boolean; keyboardType?: 'email-address';
  autoComplete?: 'email' | 'password'; returnKeyType?: 'next' | 'done';
  onChangeText: (value: string) => void; onSubmitEditing?: () => void;
};

const FOCUS_MS = 260;

export function VexGlassInput({
  label, value, placeholder, error, secureTextEntry,
  keyboardType, autoComplete, returnKeyType,
  onChangeText, onSubmitEditing,
}: VexGlassInputProps): React.JSX.Element {
  const { theme } = useTheme();
  const r = theme.borderRadius['2xl'];
  const [f, setF] = useState(false);

  const fp = useSharedValue(0);
  React.useEffect(() => {
    fp.value = withTiming(f ? 1 : 0, { duration: FOCUS_MS });
  }, [f, fp]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: f ? 0.35 : 0,
    shadowRadius: f ? 18 : 0,
    shadowColor: f ? lightColors.accent.orange : 'transparent',
    shadowOffset: { width: 0, height: f ? 4 : 0 },
  }));

  const borderColor = error
    ? lightColors.error.light
    : f
      ? 'rgba(166, 107, 255, 0.70)'
      : 'rgba(255, 255, 255, 0.06)';

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text color="semantic.liquidTextMuted" fontSize={12} fontWeight="600"
        opacity={0.88} letterSpacing={0.35}>{label}</Text>

      <Animated.View style={[glowStyle]}>
        {f && (
          <LinearGradient colors={['rgba(166,107,255,0.52)', 'rgba(255,138,61,0.22)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', top: -1, left: -1,
              right: -1, bottom: -1, borderRadius: r + 1 }} />
        )}
        {error && (
          <LinearGradient colors={['rgba(255,107,122,0.18)', 'rgba(255,107,122,0.04)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', top: -1, left: -1,
              right: -1, bottom: -1, borderRadius: r + 1 }} />
        )}

        <View style={{
          borderRadius: r, overflow: 'hidden',
          margin: f || error ? 1 : 0,
          borderWidth: !f && !error ? 1 : 0,
          borderColor: borderColor,
        }}>
          <SafeBlurView intensity={16} tint="dark"
            style={{ borderRadius: r, overflow: 'hidden' }}>
            <LinearGradient
              colors={['rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']}
              locations={[0, 0.13]} pointerEvents="none"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 24 }}
            />
            <View pointerEvents="none" style={{
              position: 'absolute', top: 0, left: 12, right: 12,
              height: 0.5, backgroundColor: 'rgba(255,255,255,0.14)',
            }} />
            <TextInput
              accessibilityHint={`Enter your VEX ${label.toLowerCase()}`}
              accessibilityLabel={label}
              autoCapitalize="none" autoComplete={autoComplete}
              keyboardType={keyboardType}
              onBlur={() => setF(false)} onChangeText={onChangeText}
              onFocus={() => setF(true)} onSubmitEditing={onSubmitEditing}
              placeholder={placeholder}
              placeholderTextColor="rgba(247,245,255,0.38)"
              returnKeyType={returnKeyType ?? (secureTextEntry ? 'done' : 'next')}
              secureTextEntry={secureTextEntry}
              style={{
                minHeight: 54,
                color: lightColors.semantic.background,
                fontSize: 16,
                paddingHorizontal: theme.spacing[4],
              }}
              value={value}
            />
          </SafeBlurView>
        </View>
      </Animated.View>

      <View style={{ minHeight: 20, justifyContent: 'center' }}>
        {error ? (
          <Text fontSize={11} fontWeight="500" opacity={0.88} letterSpacing={0.2}
            style={{ color: '#FF8B96' }}>{error}</Text>
        ) : null}
      </View>
    </View>
  );
}
