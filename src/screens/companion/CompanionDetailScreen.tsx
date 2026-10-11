import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '../../components/primitives/Box';
import { Button } from '../../components/primitives/Button';
import { Text , Text as VexText } from '../../components/primitives/Text';
import { loadCompanionState } from '../../features/companion/session-storage';
import type { CompanionState } from '../../features/companion/types';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { VexRouteShell } from '../../shared/ui/vex/VexRouteShell';
import { vexFire } from '../../theme/tokens/vex-fire';

type LoadState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
  | { status: 'success'; companion: CompanionState };

function CompanionDetailScreen(): React.ReactNode {
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const mountedRef = useRef(true);
  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const load = useCallback(() => {
    if (!userId) {
      setLoadState({ status: 'empty' });
      return;
    }
    setLoadState({ status: 'loading' });
    loadCompanionState(userId)
      .then((companion) => {
        if (!mountedRef.current) { return; }
        setLoadState({ status: 'success', companion });
      })
      .catch((caught: unknown) => {
        if (!mountedRef.current) { return; }
        setLoadState({
          status: 'error',
          error: caught instanceof Error ? caught : new Error(String(caught)),
        });
      });
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loadState.status === 'loading') {
    return (
      <Box flex={1} style={{ backgroundColor: vexFire.background }} p="lg" justifyContent="center">
        <Box
          height={28}
          width={180}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
        <Box
          mt={4}
          height={120}
          borderRadius="lg"
          bg={theme.colors.background.secondary}
        />
      </Box>
    );
  }

  if (loadState.status === 'empty') {
    return (
      <Box flex={1} style={{ backgroundColor: vexFire.background }} p="lg" justifyContent="center">
        <Text variant="h4" color="text.primary">
          Your companion needs an active profile.
        </Text>
      </Box>
    );
  }

  if (loadState.status === 'error') {
    return (
      <Box flex={1} style={{ backgroundColor: vexFire.background }} p="lg" justifyContent="center">
        <Text variant="h4" color={theme.colors.error.DEFAULT}>
          Companion details did not load.
        </Text>
        <Text variant="body" color="text.secondary" mt={2}>
          VEX kept the session safe. Retry the companion profile.
        </Text>
        <Button variant="secondary"
          onPress={load}
          style={{ marginTop: theme.spacing[4] }}
          accessibilityLabel="Retry loading companion"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <VexText>Retry</VexText>
        </Button>
      </Box>
    );
  }

  const { companion } = loadState;

  return (
    <VexRouteShell atmosphere="utility" eyebrow="Living companion" title={companion.currentMood} subtitle="A quiet record of the focus you build together." onBack={() => navigation.goBack()}>
      <Box p={4} borderRadius="lg" style={{ backgroundColor: vexFire.panel, borderColor: vexFire.border, borderWidth: 1 }}>
        <Text variant="h4" style={{ color: vexFire.cream }}>{companion.phase} · Level {companion.level}</Text>
        <Text variant="body" style={{ color: vexFire.textSecondary }} mt={2}>{Math.floor(companion.totalFocusMinutes)} focus minutes together.</Text>
        <Text variant="caption" style={{ color: vexFire.amber }} mt={2}>Element affinity {companion.elementAffinity}% · {companion.element}</Text>
      </Box>
    </VexRouteShell>
  );
}

const CompanionDetailScreenWithBoundary = withScreenErrorBoundary(CompanionDetailScreen, "CompanionDetail");
export { CompanionDetailScreenWithBoundary as CompanionDetailScreen };

export { CompanionDetailScreen as default };
