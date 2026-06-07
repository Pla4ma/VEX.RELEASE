import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import { OfflineBanner } from '../../shared/ui/components/OfflineBanner';
import { GlassScreen } from '../glass/GlassScreen';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const content = {
    paddingBottom: bottomInset
      ? insets.bottom + 112
      : theme.spacing[8],
    paddingHorizontal: padded ? theme.spacing[5] : 0,
    paddingTop: theme.spacing[4],
    ...contentStyle,
  };
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, content]}>{children}</View>
  );

  const screen = (
    <GlassScreen contentStyle={{ backgroundColor: 'transparent' }} showAura={false}>
      <StatusBar style="dark" />
      <View style={[{ backgroundColor: 'transparent', flex: 1 }, style]}>
        {body}
        <OfflineBanner />
      </View>
    </GlassScreen>
  );

  void vexLightGlass;

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
