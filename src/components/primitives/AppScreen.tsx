import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';

interface AppScreenProps {
  children: ReactNode;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  padded?: boolean;
  contentStyle?: ViewStyle;
  style?: ViewStyle;
  bottomInset?: boolean;
}

export function AppScreen({
  children,
  scroll = true,
  keyboardAvoiding = false,
  padded = true,
  contentStyle,
  style,
  bottomInset = true,
}: AppScreenProps): JSX.Element {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const background = theme.colors.semantic.background;
  const content = {
    paddingBottom: bottomInset
      ? insets.bottom + theme.spacing[8]
      : theme.spacing[8],
    paddingHorizontal: padded ? theme.spacing[5] : 0,
    paddingTop: insets.top + theme.spacing[5],
    ...contentStyle,
  };
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={content}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, content]}>{children}</View>
  );

  const screen = (
    <View style={[{ backgroundColor: background, flex: 1 }, style]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient
        colors={[
          `${theme.colors.primary[900]}90`,
          theme.colors.semantic.background,
          theme.colors.semantic.background,
        ]}
        locations={[0, 0.42, 1]}
        pointerEvents="none"
        style={{ height: 320, left: 0, position: 'absolute', right: 0, top: 0 }}
      />
      {body}
    </View>
  );

  if (!keyboardAvoiding) {
    return screen;
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      {screen}
    </KeyboardAvoidingView>
  );
}
