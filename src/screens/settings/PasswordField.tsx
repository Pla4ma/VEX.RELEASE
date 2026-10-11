import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { TextInput } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  marginBottom?: number;
}

export const PasswordField: React.ComponentType<PasswordFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  marginBottom = 12,
}) => {
  const { theme: _theme } = useTheme();

  return (
    <Box mb={marginBottom}>
      <Text
        variant="caption"
        color={vexFire.textSecondary}
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
          backgroundColor: vexFire.panel,
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: vexFire.border,
          color: vexFire.cream,
        }}
        placeholderTextColor={vexFire.textMuted}
      />
    </Box>
  );
};
