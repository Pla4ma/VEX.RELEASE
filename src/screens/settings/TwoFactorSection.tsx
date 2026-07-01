import React, { useCallback, useState } from 'react';
import { Pressable, Switch, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Card } from '../../components/primitives'
import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';
import { useUIStore } from '../../store/index';
import { lightColors } from '@/theme/tokens/colors';


export const TwoFactorSection: React.ComponentType = () => {
  const { theme } = useTheme();
  const { showToast } = useUIStore();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleTwoFactorToggle = useCallback(() => {
    if (!twoFactorEnabled) {
      Alert.alert(
        'Enable Two-Factor Authentication?',
        'You will need an authenticator app like Google Authenticator or Authy.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setTwoFactorEnabled(true);
              showToast({
                message:
                  '2FA enabled. Please set up in your authenticator app.',
                type: 'success',
                duration: 5000,
              });
            },
          },
        ],
      );
    } else {
      Alert.alert(
        'Disable Two-Factor Authentication?',
        'This makes your account less secure. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setTwoFactorEnabled(false);
              showToast({
                message: '2FA has been disabled',
                type: 'warning',
                duration: 3000,
              });
            },
          },
        ],
      );
    }
  }, [twoFactorEnabled, showToast]);

  return (
    <Box px={16} mb={24}>
      <Text
        variant="caption"
        color="text.secondary"
        style={{
          marginLeft: 12,
          marginBottom: 8,
          fontWeight: '600',
          letterSpacing: 0.5,
        }}
      >
        SECURITY
      </Text>
      <Card size="sm" style={{ overflow: 'hidden' }}>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
          onPress={handleTwoFactorToggle}
          accessibilityLabel="Two-factor authentication"
          accessibilityRole="button"
          accessibilityHint="Double tap to change setting"
        >
          <Box
            width={40}
            height={40}
            borderRadius={10}
            justifyContent="center"
            alignItems="center"
            style={{
              backgroundColor: twoFactorEnabled
                ? theme.colors.success[50] || lightColors.success[50]
                : theme.colors.background.secondary,
            }}
          >
            <Icon
              name="shield"
              size={20}
              color={
                twoFactorEnabled
                  ? theme.colors.success.DEFAULT
                  : theme.colors.text.tertiary
              }
            />
          </Box>

          <Box flex={1} ml={12}>
            <Text
              variant="body"
              style={{
                fontWeight: '500',
                color: theme.colors.text.primary,
              }}
            >
              Two-Factor Authentication
            </Text>
            <Text
              variant="caption"
              color="text.secondary"
              style={{ marginTop: 2 }}
            >
              {twoFactorEnabled ? 'Enabled' : 'Add extra security'}
            </Text>
          </Box>

          <Switch
            value={twoFactorEnabled}
            onValueChange={handleTwoFactorToggle}
            trackColor={{
              false: theme.colors.background.tertiary,
              true: theme.colors.success.DEFAULT + '80',
            }}
            thumbColor={
              twoFactorEnabled
                ? theme.colors.success.DEFAULT
                : lightColors.text.inverse
            }
          />
        </Pressable>
      </Card>
    </Box>
  );
};
