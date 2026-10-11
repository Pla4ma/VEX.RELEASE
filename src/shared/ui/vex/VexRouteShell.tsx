import React, { useContext } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  View,
  type ScrollViewProps,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';

const ART = {
  analytics: require('../../../../assets/vex/analytics/analytics-lens.png'),
  session: require('../../../../assets/vex/session/history-archive.png'),
  settings: require('../../../../assets/vex/utility/notification-signal.png'),
  study: require('../../../../assets/vex/study/library-codex.png'),
  utility: require('../../../../assets/vex/utility/companion-portal.png'),
} as const;

export type VexRouteAtmosphere = keyof typeof ART;

type VexRouteShellProps = ScrollViewProps & {
  atmosphere: VexRouteAtmosphere;
  eyebrow: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
};

export function VexRouteShell({
  atmosphere,
  eyebrow,
  title,
  subtitle,
  onBack,
  children,
  contentContainerStyle,
  ...scrollProps
}: VexRouteShellProps): React.JSX.Element {
  const insets = useContext(SafeAreaInsetsContext) ?? { bottom: 0, top: 0 };
  const { theme } = useTheme();
  const navigation = useNavigation();
  const handleBack = onBack ?? (() => navigation.goBack());
  const canNavigateBack = typeof navigation?.canGoBack === 'function' && navigation.canGoBack();

  return (
    <View style={{ backgroundColor: vexFire.background, flex: 1 }}>
      <Image
        accessibilityIgnoresInvertColors
        source={ART[atmosphere]}
        resizeMode="contain"
        style={{
          height: theme.spacing[24] * 2,
          opacity: 0.16,
          position: 'absolute',
          right: -theme.spacing[12],
          top: insets.top - theme.spacing[12],
          width: theme.spacing[24] * 2,
        }}
      />
      <View
        style={{
          backgroundColor: vexFire.background,
          bottom: 0,
          left: 0,
          opacity: 0.72,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
        pointerEvents="none"
      />
      <ScrollView
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { paddingBottom: insets.bottom + theme.spacing[16] },
          contentContainerStyle,
        ]}
      >
        <View style={{ paddingHorizontal: theme.spacing[5], paddingTop: insets.top + theme.spacing[5] }}>
          {canNavigateBack || onBack ? (
            <Pressable
              accessibilityHint="Returns to the previous VEX screen"
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={theme.spacing[2]}
              onPress={handleBack}
              style={{ marginBottom: theme.spacing[5], minHeight: theme.spacing[12], justifyContent: 'center' }}
            >
              <Text style={{ color: vexFire.amber, fontSize: theme.typography.ui.label.fontSize, fontWeight: '800', letterSpacing: 1.2 }}>
                ← BACK
              </Text>
            </Pressable>
          ) : null}
          <Text style={{ color: vexFire.ember, fontSize: theme.typography.ui.overline.fontSize, fontWeight: '900', letterSpacing: 1.6 }}>
            {eyebrow.toUpperCase()}
          </Text>
          <Text style={{ color: vexFire.cream, fontSize: theme.typography.heading.h1.fontSize, fontWeight: '900', letterSpacing: -0.8, marginTop: theme.spacing[2] }}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ color: vexFire.textSecondary, fontSize: theme.typography.body.medium.fontSize, lineHeight: theme.typography.body.medium.lineHeight, marginTop: theme.spacing[2], maxWidth: '92%' }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={{ paddingHorizontal: theme.spacing[5], paddingTop: theme.spacing[6] }}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}
