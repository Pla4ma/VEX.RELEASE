import React from 'react';
import { TextInput } from 'react-native';
import { useTheme } from '../../theme';
import { Box, Text } from '../../components/primitives';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  marginBottom?: number;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  marginBottom = 12,
}) => {
  const { theme } = useTheme();

  return (
    <Box mb={marginBottom}>
      <Text
        variant="caption"
        color="text.secondary"
        style={{ marginBottom: 4 }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry
        maxLength={128}
        style={{
          backgroundColor: theme.colors.background.secondary,
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          color: theme.colors.text.primary,
        }}
        placeholderTextColor={theme.colors.text.tertiary}
      />
    </Box>
  );
};
