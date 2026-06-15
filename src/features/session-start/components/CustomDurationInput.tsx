import React from 'react';
import { TextInput, Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { PRESETS, type DurationPreset } from './duration-picker-types';

export function CustomDurationInput({
  value,
  onChange,
  isActive,
  onActivate,
}: {
  value: number | null;
  onChange: (minutes: number) => void;
  isActive: boolean;
  onActivate: () => void;
}): React.ReactNode {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = React.useState(
    value && !PRESETS.includes(value as DurationPreset) ? value.toString() : '',
  );
  const handleSubmit = () => {
    const num = parseInt(inputValue, 10);
    if (num >= 5 && num <= 180) {
      onChange(num);
    }
  };
  if (isActive) {
    return (
      <Box
        flexDirection="row"
        alignItems="center"
        gap="sm"
        px="md"
        py="sm"
        borderRadius="xl"
        borderWidth={2}
        borderColor={theme.colors.primary[500]}
        bg={theme.colors.background.primary}
      >
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleSubmit}
          onBlur={handleSubmit}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="5-180"
          style={{
            width: 60,
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text.primary,
            textAlign: 'center',
          }}
          autoFocus
        />
        <Text variant="bodySmall" color="text.secondary">
          min
        </Text>
      </Box>
    );
  }
  return (
    <Pressable
      onPress={onActivate}
      accessibilityLabel="Enter custom duration"
      accessibilityRole="button"
      accessibilityHint="Double tap to activate"
    >
      <Box
        px="md"
        py="md"
        borderRadius="xl"
        bg={theme.colors.background.secondary}
        borderWidth={2}
        borderColor={theme.colors.border.DEFAULT}
        style={{ borderStyle: 'dashed' }}
      >
        <Text variant="body" color="text.secondary" fontWeight="500">
          Custom
        </Text>
      </Box>
    </Pressable>
  );
}
