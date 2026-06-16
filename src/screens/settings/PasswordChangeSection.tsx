import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Box, Card } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';
import { lightColors } from '@/theme/tokens/colors';

import { PasswordField } from './PasswordField';
import { usePasswordChange } from './usePasswordChange';

              const elementStyle_129 = {
  flex: 1,
  backgroundColor: theme.colors.background.secondary,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  marginRight: 8,
  borderWidth: 1,
  borderColor: theme.colors.border.light,
};
export const PasswordChangeSection: React.FC = () => {
  const { theme } = useTheme();
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPasswordFields,
    setShowPasswordFields,
    isChangingPassword,
    handleChangePassword,
  } = usePasswordChange();

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
        PASSWORD
      </Text>
      <Card size="sm" style={{ overflow: 'hidden' }}>
        {!showPasswordFields ? (
          <Pressable
            onPress={() => setShowPasswordFields(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 16,
            }}
            accessibilityLabel="Password change"
            accessibilityRole="button"
            accessibilityHint="Double tap to change setting"
          >
            <Box
              width={40}
              height={40}
              borderRadius={10}
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: theme.colors.background.secondary }}
            >
              <Icon
                name="lock"
                size={20}
                color={theme.colors.text.tertiary}
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
                Change Password
              </Text>
              <Text
                variant="caption"
                color="text.secondary"
                style={{ marginTop: 2 }}
              >
                Update your account password
              </Text>
            </Box>

            <Icon
              name="arrow-right"
              size={20}
              color={theme.colors.text.tertiary}
            />
          </Pressable>
        ) : (
          <Box p={16}>
            <Text
              variant="body"
              style={{
                fontWeight: '600',
                marginBottom: 16,
                color: theme.colors.text.primary,
              }}
            >
              Change Password
            </Text>

            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
            />
            <PasswordField
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
            />
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              marginBottom={16}
            />

            <Box flexDirection="row">
              <Pressable
                onPress={() => setShowPasswordFields(false)}
                style={elementStyle_129}
                accessibilityLabel="Cancel password change"
                accessibilityRole="button"
                accessibilityHint="Double tap to change setting"
              >
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleChangePassword}
                disabled={isChangingPassword}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.primary[500],
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginLeft: 8,
                  opacity: isChangingPassword ? 0.7 : 1,
                }}
                accessibilityLabel="Password change"
                accessibilityRole="button"
                accessibilityHint="Double tap to change setting"
              >
                <Text
                  style={{ color: lightColors.text.inverse, fontWeight: '600' }}
                >
                  {isChangingPassword ? 'Changing...' : 'Change'}
                </Text>
              </Pressable>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
};
