import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { VexSignalPath } from '../../../shared/ui/vex/VexSignalPath';
import { VexSurface } from '../../../shared/ui/vex/VexSurface';
import { VexIcon } from '../../../shared/ui/vex/VexIcon';
import type { FocusScoreDashboardModel } from '../../../features/focus-identity/types';
import { vexFire } from '../../../theme/tokens/vex-fire';

interface ProgressOverviewProps {
  completedSessions: number;
  focusModel: FocusScoreDashboardModel;
}

const SIGNALS = [
  { title: 'Presence', subtitle: 'You arrived for the work.' },
  { title: 'Awareness', subtitle: 'You noticed the friction.' },
  { title: 'Stability', subtitle: 'You kept the promise small.' },
  { title: 'Focus', subtitle: 'You protected the block.' },
  { title: 'Momentum', subtitle: 'You returned with less effort.' },
  { title: 'Integration', subtitle: 'The rhythm is becoming yours.' },
  { title: 'Mastery', subtitle: 'The system disappears into you.' },
] as const;

function ProgressError({ onRetry }: { onRetry: () => void }): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <VexSurface tone="quiet" style={{ marginBottom: theme.spacing[4], padding: theme.spacing[4] }}>
      <Text color={vexFire.amber} variant="label">Signal interrupted</Text>
      <Text variant="body" style={{ marginTop: theme.spacing[1] }}>VEX couldn’t refresh your latest rhythm.</Text>
      <Pressable accessibilityHint="Try loading your focus rhythm again" accessibilityLabel="Retry progress" accessibilityRole="button" onPress={onRetry} style={{ minHeight: 44, justifyContent: 'center', marginTop: theme.spacing[2] }}>
        <Text color={vexFire.ember} variant="button">Try again</Text>
      </Pressable>
    </VexSurface>
  );
}

export function ProgressOverview({
  completedSessions,
  focusModel,
}: ProgressOverviewProps): React.JSX.Element {
  const { theme } = useTheme();
  if (focusModel.isError) return <ProgressError onRetry={focusModel.refetch} />;

  const score = focusModel.current?.currentScore ?? 0;
  const currentIndex = completedSessions === 0 ? 0 : Math.min(6, Math.max(1, Math.round(score / 16)));

  return (
    <View style={{ gap: theme.spacing[4] }}>
      {focusModel.isOffline ? (
        <VexSurface tone="quiet" style={{ padding: theme.spacing[3] }}>
          <Text color={vexFire.amber} variant="caption">Offline · cached rhythm shown</Text>
        </VexSurface>
      ) : null}
      <View style={{ paddingHorizontal: theme.spacing[2] }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[2] }}>
          <View style={{ gap: theme.spacing[1] }}>
            <Text variant="h4">The signal path</Text>
            <Text color="text.tertiary" variant="bodySmall">Every return makes the next one easier.</Text>
          </View>
          <VexIcon color={vexFire.ember} name="sparkles" size="md" variant="outline" />
        </View>
        <VexSignalPath currentIndex={currentIndex} fireThread items={SIGNALS} />
      </View>
    </View>
  );
}
