import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';
import { useAuthStore } from '../../store/index';
import type { SettingsStackParams } from '../../navigation';
import { EmailChangeSection } from './EmailChangeSection';
import { TwoFactorSection } from './TwoFactorSection';
import { PasswordChangeSection } from './PasswordChangeSection';
import {
  LiquidGlassHeader,
  liquidGlassSpacing,
} from '../../shared/ui/liquid-glass/LiquidGlassHeader';
import { LiquidGlassScreen } from '../../shared/ui/liquid-glass/LiquidGlassScreen';

type Props = NativeStackScreenProps<SettingsStackParams, 'AccountSettings'>;

const AccountSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LiquidGlassScreen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Box
            px={liquidGlassSpacing.screenX}
            pb={16}
            pt={insets.top + liquidGlassSpacing.screenTop}
            flexDirection="row"
            alignItems="center"
          >
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ marginRight: 12 }}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              accessibilityHint="Returns to settings"
            >
              <Icon
                name="arrow-left"
                size={24}
                color={theme.colors.text.primary}
              />
            </Pressable>
            <LiquidGlassHeader
              eyebrow="Identity"
              title="Account"
              body="Protect sign-in, email, and recovery paths."
            />
          </Box>

          <EmailChangeSection email={user?.email} />
          <TwoFactorSection />
          <PasswordChangeSection />

          <Box height={insets.bottom + 20} />
        </ScrollView>
      </LiquidGlassScreen>
    </KeyboardAvoidingView>
  );
};

const AccountSettingsScreenWithBoundary = withScreenErrorBoundary(AccountSettingsScreen, "AccountSettings");
export { AccountSettingsScreenWithBoundary as AccountSettingsScreen };
