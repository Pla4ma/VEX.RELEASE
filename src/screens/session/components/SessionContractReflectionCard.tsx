import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { triggerHaptic } from '../../../utils/haptics';
import type {
  FocusContract,
  ReflectionStatus,
} from '../../../features/focus-contract/types';
import { getReflectionCopy } from '../../../features/focus-contract/service';

type SessionContractReflectionCardProps = {
  contract: FocusContract | null;
  onReflect: (status: ReflectionStatus) => void;
  isPending: boolean;
};

const options: Array<{
  status: ReflectionStatus;
  label: string;
  hint: string;
}> = [
  {
    status: 'done',
    label: 'Done',
    hint: 'Marks your focus contract as completed',
  },
  {
    status: 'partial',
    label: 'Partial',
    hint: 'Marks your focus contract as partly completed',
  },
  {
    status: 'not_done',
    label: 'Not this time',
    hint: 'Marks your focus contract as not completed',
  },
];

export function SessionContractReflectionCard({
  contract,
  onReflect,
  isPending,
}: SessionContractReflectionCardProps): React.JSX.Element | null {
  const { theme } = useTheme();
  const reflectedStatus =
    contract?.completionStatus && contract.completionStatus !== 'skipped'
      ? contract.completionStatus
      : null;

  if (!contract) {
    return null;
  }

  const handleReflect = (status: ReflectionStatus): void => {
    triggerHaptic(status === 'done' ? 'success' : 'impactLight');
    onReflect(status);
  };

  return (
    <Box
      mx="lg"
      mb="md"
      bg="background.elevated"
      borderRadius={theme.borderRadius.lg}
      p="lg"
    >
      <Text variant="h4" mb="sm">
        Did you do it?
      </Text>
      <Box borderLeftWidth={2} borderLeftColor="primary.500" pl="md" mb="md">
        <Text variant="body" color="text.secondary">
          {contract.taskDescription}
        </Text>
      </Box>
      <Box>
        {options.map((option) => (
          <Button
            key={option.status}
            accessibilityHint={option.hint}
            accessibilityLabel={`Focus contract reflection: ${option.label}`}
            disabled={isPending || Boolean(reflectedStatus)}
            haptic="none"
            mb="sm"
            onPress={() => handleReflect(option.status)}
            variant={reflectedStatus === option.status ? 'primary' : 'outline'}
          >
            {option.label}
          </Button>
        ))}
      </Box>
      {reflectedStatus ? (
        <Text variant="caption" color="text.secondary" mt="md">
          {getReflectionCopy(reflectedStatus)}
        </Text>
      ) : null}
    </Box>
  );
}
