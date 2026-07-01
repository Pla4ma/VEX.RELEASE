import React, { useCallback } from 'react';
import { Alert, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Card } from '../../components/primitives'
import { Text } from '../../components/primitives/Text';
import { useUIStore } from '../../store/index';
import { lightColors } from '@/theme/tokens/colors';


interface EmailChangeSectionProps {
  email: string | undefined;
}

export const EmailChangeSection: React.ComponentType<EmailChangeSectionProps> = ({
  email,
}) => {
  const { theme } = useTheme();
  const { showToast } = useUIStore();

  const handleChangeEmail = useCallback(() => {
    Alert.alert(
      'Change Email Address',
      'A verification link will be sent to your new email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            showToast({
              message: 'Email change flow started',
              type: 'info',
              duration: 3000,
            });
          },
        },
      ],
    );
  }, [showToast]);

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
        EMAIL ADDRESS
      </Text>
      <Card size="sm" style={{ overflow: 'hidden' }}>
        <Box p={16}>
          <Text
            variant="body"
            color="text.secondary"
            style={{ marginBottom: 4 }}
          >
            Current Email
          </Text>
          <Text
            variant="body"
            style={{ fontWeight: '500', marginBottom: 12 }}
          >
            {email || '---'}
          </Text>
          <Pressable
            onPress={handleChangeEmail}
            style={{
              backgroundColor: theme.colors.primary[500],
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: 'center',
            }}
            accessibilityLabel="Change email"
            accessibilityRole="button"
            accessibilityHint="Double tap to change setting"
          >
            <Text
              style={{ color: lightColors.text.inverse, fontWeight: '600' }}
            >
              Change Email
            </Text>
          </Pressable>
        </Box>
      </Card>
    </Box>
  );
};
