import React from 'react';
import { Pressable, TextInput } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import {
  getMinTouchTargetStyle,
  StandardHitSlops,
} from '../../../utils/touchTarget';

type SessionContractInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  disabled?: boolean;
};

export function SessionContractInput({
  value,
  onChangeText,
  disabled,
}: SessionContractInputProps): React.JSX.Element {
  const { theme } = useTheme();
  const trimmedLength = value.trim().length;
  const showCounter = value.length >= 60;
  const showGuidance = trimmedLength > 0 && trimmedLength < 3;

  const handleChange = (next: string): void => {
    onChangeText(next.replace(/\r?\n/g, '').slice(0, 80));
  };

  return (
    <Box mt="md">
      <Box
        bg="background.elevated"
        borderColor="border.light"
        borderRadius={theme.borderRadius.lg}
        borderWidth={1}
        p="md"
      >
        <Box flexDirection="row" alignItems="center">
          <TextInput
            accessibilityHint="Describe the specific task you will work on during this session"
            accessibilityLabel="Focus contract - optional task description"
            editable={!disabled}
            maxLength={80}
            onChangeText={handleChange}
            placeholder="What will you focus on? (optional)"
            placeholderTextColor={theme.colors.text.tertiary}
            returnKeyType="done"
            style={{
              color: theme.colors.text.primary,
              flex: 1,
              minHeight: 44,
              padding: 0,
            }}
            value={value}
          />
          {value.length > 0 ? (
            <Pressable
              accessibilityHint="Clears the focus contract field"
              accessibilityLabel="Clear focus contract"
              accessibilityRole="button"
              hitSlop={StandardHitSlops.ICON}
              onPress={() => onChangeText('')}
              style={getMinTouchTargetStyle()}
            >
              <Box flex={1} alignItems="center" justifyContent="center">
                <Icon name="x" size="sm" color={theme.colors.text.secondary} />
              </Box>
            </Pressable>
          ) : null}
        </Box>
        {showGuidance ? (
          <Text variant="caption" color="text.secondary" mt="xs">
            Add a little more detail, or start without a contract.
          </Text>
        ) : null}
        {showCounter ? (
          <Text
            variant="caption"
            color="text.tertiary"
            mt="xs"
            textAlign="right"
          >
            {value.length}/80
          </Text>
        ) : null}
      </Box>
    </Box>
  );
}
