import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { Box, Text } from '../../components/primitives';
import { Icon } from '../../icons';
import { useAuthStore } from '../../store/index';
import type { SettingsStackParams } from '../../navigation';
import { EmailChangeSection } from './EmailChangeSection';
import { TwoFactorSection } from './TwoFactorSection';
import { PasswordChangeSection } from './PasswordChangeSection';

type Props = NativeStackScreenProps<SettingsStackParams, 'AccountSettings'>;

export const AccountSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box
          px={20}
          pb={16}
          pt={insets.top + 16}
          flexDirection="row"
          alignItems="center"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
            accessibilityLabel="Account setting"
            accessibilityRole="button"
            accessibilityHint="Double tap to change setting"
          >
            <Icon
              name="arrow-left"
              size={24}
              color={theme.colors.text.primary}
            />
          </Pressable>
          <Text variant="h2">Account</Text>
        </Box>

        <EmailChangeSection email={user?.email} />
        <TwoFactorSection />
        <PasswordChangeSection />

        <Box height={insets.bottom + 20} />
      </ScrollView>
    </Box>
  );
};

export default withScreenErrorBoundary(
  AccountSettingsScreen,
  'AccountSettings',
);
