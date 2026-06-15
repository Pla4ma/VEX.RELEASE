import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';

export function VaultScreen(): React.ReactNode {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <Box
        flex={1}
        px="lg"
        pt="xl"
        justifyContent="center"
        alignItems="center"
        gap="md"
      >
        <Text variant="h2" color="text.primary">
          Vault
        </Text>
        <Text variant="body" color="text.secondary" textAlign="center">
          Chests and collectibles are archived.
          {'\n'}Your progress comes from focus sessions,
          {'\n'}not loot drops.
        </Text>
        <Text variant="caption" color="text.tertiary">
          Keep building your rhythm — that is the real reward.
        </Text>
      </Box>
    </SafeAreaView>
  );
}

export default withScreenErrorBoundary(VaultScreen, 'Vault');
