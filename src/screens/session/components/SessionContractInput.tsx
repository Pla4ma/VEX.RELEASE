import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { Pressable, TextInput } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { VexIcon } from '../../../shared/ui/vex/VexIcon';
import { useTheme } from '../../../theme/ThemeContext';
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
        borderRadius={theme.borderRadius.lg}
        p="md"
        style={{
          backgroundColor: vexFire.backgroundRaised,
          borderColor: vexFire.border,
          borderWidth: 1,
          boxShadow: `0px 2px 8px ${vexFire.shadow} / 0.08`,
        }}
      >
        <Box flexDirection="row" alignItems="center">
          <TextInput
            accessibilityHint="Describe the specific task you will work on during this session"
            accessibilityLabel="Focus contract - optional task description"
            editable={!disabled}
            maxLength={80}
            onChangeText={handleChange}
            placeholder="What will you focus on? (optional)"
            placeholderTextColor={vexFire.textMuted}
            returnKeyType="done"
            style={{
              color: vexFire.cream,
              flex: 1,
              minHeight: 44,
              padding: 0,
              fontSize: 16,
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
                <VexIcon name="x" size="sm" color={vexFire.textSecondary} variant="solid" />
              </Box>
            </Pressable>
          ) : null}
        </Box>
        {showGuidance ? (
          <Text variant="caption" color={vexFire.textSecondary} mt="xs">
            Add a little more detail, or start without a contract.
          </Text>
        ) : null}
        {showCounter ? (
          <Text
            variant="caption"
            color={vexFire.textMuted}
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
