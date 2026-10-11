import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Card } from '../../components/primitives'
import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';


import { PasswordField } from './PasswordField';
import { usePasswordChange } from './usePasswordChange';

export const PasswordChangeSection: React.ComponentType = () => {
  const { theme: _theme } = useTheme();
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
        color={vexFire.textSecondary}
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
              style={{ backgroundColor: vexFire.panel }}
            >
              <Icon
                name="lock"
                size={20}
                color={vexFire.textMuted}
              />
            </Box>

            <Box flex={1} ml={12}>
              <Text
                variant="body"
                style={{
                  fontWeight: '500',
                  color: vexFire.cream,
                }}
              >
                Change Password
              </Text>
              <Text
                variant="caption"
                color={vexFire.textSecondary}
                style={{ marginTop: 2 }}
              >
                Update your account password
              </Text>
            </Box>

            <Icon
              name="arrow-right"
              size={20}
              color={vexFire.textMuted}
            />
          </Pressable>
        ) : (
          <Box p={16}>
            <Text
              variant="body"
              style={{
                fontWeight: '600',
                marginBottom: 16,
                color: vexFire.cream,
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
                style={{
                  flex: 1,
                  backgroundColor: vexFire.panel,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: vexFire.border,
                }}
                accessibilityLabel="Cancel password change"
                accessibilityRole="button"
                accessibilityHint="Double tap to change setting"
              >
                <Text
                  style={{
                    color: vexFire.cream,
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
                  backgroundColor: vexFire.ember,
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
                  style={{ color: vexFire.cream, fontWeight: '600' }}
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
