import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { triggerHaptic } from '../../../utils/haptics';
import {
  getMinTouchTargetStyle,
  StandardHitSlops,
} from '../../../utils/touchTarget';
import type { FocusContract } from '../../../features/focus-contract/types';
import {
  getContractReminderStage,
  type ContractReminderStage,
} from '../../../features/focus-contract/service';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

type SessionContractReminderProps = {
  contract: FocusContract | null;
  progressPercentage: number;
};

export function SessionContractReminder({
  contract,
  progressPercentage,
}: SessionContractReminderProps): React.JSX.Element | null {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const [dismissedStages, setDismissedStages] = React.useState<
    ContractReminderStage[]
  >([]);
  const stage = getContractReminderStage(contract, progressPercentage);

  if (!contract || !stage || dismissedStages.includes(stage)) {
    return null;
  }

  const handleDismiss = (): void => {
    setDismissedStages((current) => Array.from(new Set([...current, stage])));
    if (!isReducedMotion) {
      triggerHaptic('impactLight');
    }
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
        <Text
          variant="caption"
          color="text.secondary"
          numberOfLines={2}
          flex={1}
        >
          {stage === 'early' ? 'You chose ' : 'Final stretch for '}
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
