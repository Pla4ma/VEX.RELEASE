import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { triggerHaptic } from '../../../utils/haptics';
import { getMinTouchTargetStyle, StandardHitSlops } from '../../../utils/touchTarget';
import type { FocusContract } from '../../../features/focus-contract/types';

type SessionContractReminderProps = {
  contract: FocusContract | null;
};

export function SessionContractReminder({
  contract,
}: SessionContractReminderProps): React.JSX.Element | null {
  const { theme } = useTheme();
  const [dismissed, setDismissed] = React.useState(false);

  if (!contract || dismissed) {
    return null;
  }

  const handleDismiss = (): void => {
    setDismissed(true);
    void triggerHaptic('impactLight');
  };

  return (
    <Box px="lg" mt="sm">
      <Box
        bg="background.elevated"
        borderColor="border.light"
        borderRadius={theme.borderRadius.lg}
        borderWidth={1}
        flexDirection="row"
        alignItems="center"
        p="sm"
      >
        <Text variant="caption" color="text.secondary" numberOfLines={1} flex={1}>
          {contract.taskDescription}
        </Text>
        <Pressable
          accessibilityHint="Hides the focus contract reminder for this session"
          accessibilityLabel="Dismiss focus contract reminder"
          accessibilityRole="button"
          hitSlop={StandardHitSlops.ICON}
          onPress={handleDismiss}
          style={getMinTouchTargetStyle()}
        >
          <Box flex={1} alignItems="center" justifyContent="center">
            <Icon name="x" size="sm" color={theme.colors.text.secondary} />
          </Box>
        </Pressable>
      </Box>
    </Box>
  );
}
