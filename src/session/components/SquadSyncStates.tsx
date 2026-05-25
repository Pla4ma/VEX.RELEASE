import { Box } from "../../components/primitives/Box";
import { Text } from "../../components/primitives/Text";
import { useTheme } from "../../theme";

export function SquadSyncLoadingState(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box flexDirection="row" gap="sm">
      {[1, 2, 3].map((item) => (
        <Box
          key={item}
          width={100}
          height={40}
          borderRadius="xl"
          bg={theme.colors.background.tertiary}
        />
      ))}
    </Box>
  );
}

export function SquadSyncEmptyState(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box px="md" py="sm" borderRadius="xl" bg={`${theme.colors.background.elevated}80`}
      borderWidth={1} borderColor={theme.colors.border.DEFAULT}
    >
      <Text variant="caption" color="text.tertiary">
        No squad members currently focusing
      </Text>
    </Box>
  );
}

export function SquadSyncHeader({ focusingCount }: { focusingCount: number }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box flexDirection="row" alignItems="center" gap="sm" mb="sm">
      <Text fontSize={16}>🛡️</Text>
      <Text variant="label" color="text.secondary">
        SQUAD SYNC
      </Text>
      {focusingCount > 0 && (
        <Box px="sm" py="xs" borderRadius="full" bg={`${theme.colors.success[500]}20`}>
          <Text variant="caption" color={theme.colors.success.DEFAULT} fontWeight="700" fontSize={10}>
            {focusingCount} focusing
          </Text>
        </Box>
      )}
    </Box>
  );
}
