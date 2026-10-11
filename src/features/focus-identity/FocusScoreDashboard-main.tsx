import React from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { VexRouteShell } from '../../shared/ui/vex/VexRouteShell';
import { useFocusScore } from './hooks-focus-score';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { useNetInfo } from '../../network/useNetInfo';
import { vexFire } from '../../theme/tokens/vex-fire';
import { useTheme } from '../../theme/ThemeContext';
import { borderRadius } from '../../theme/tokens/radius';
import { Text } from '../../components/primitives/Text';
import { formatDelta, formatHistoryPoint } from './FocusScoreDashboard-helpers';

type Navigation = NativeStackNavigationProp<ExtendedRootStackParams>;

function ScoreSkeleton(): React.JSX.Element {
  const { theme } = useTheme();
  const block = { backgroundColor: vexFire.panel, borderRadius: borderRadius.lg };
  return (
    <View testID="focus-score-dashboard-skeleton" style={{ gap: theme.spacing[4] }}>
      <View style={[block, { height: theme.spacing[12], width: '42%' }]} />
      <View style={[block, { height: theme.spacing[24] * 3, width: '100%' }]} />
      <View style={[block, { height: theme.spacing[16], width: '100%' }]} />
      <View style={[block, { height: theme.spacing[20], width: '100%' }]} />
    </View>
  );
}

function FocusScoreDashboardInner(): React.JSX.Element {
  const navigation = useNavigation<Navigation>();
  const { score, history, status, error, refetch, isRefetching } = useFocusScore();
  const { isOffline } = useNetInfo();
  const { theme } = useTheme();

  if (status === 'pending') {
    return (
      <VexRouteShell atmosphere="analytics" eyebrow="Focus intelligence" title="Focus Score" subtitle="A living read on the attention you are building." onBack={() => navigation.goBack()}>
        <ScoreSkeleton />
      </VexRouteShell>
    );
  }

  if (status === 'error') {
    return (
      <VexRouteShell atmosphere="analytics" eyebrow="Signal interrupted" title="Focus Score" onBack={() => navigation.goBack()}>
          <View style={{ alignItems: 'center', backgroundColor: vexFire.panel, borderColor: vexFire.border, borderRadius: borderRadius.lg, borderWidth: 1, padding: theme.spacing[6] }}>
          <View style={{ alignItems: 'center', backgroundColor: vexFire.backgroundSoft, borderRadius: borderRadius.full, height: theme.spacing[16], justifyContent: 'center', marginBottom: theme.spacing[4], width: theme.spacing[16] }}>
            <View style={{ backgroundColor: vexFire.danger, borderRadius: borderRadius.full, height: theme.spacing[3], width: theme.spacing[3] }} />
          </View>
          <TextBlock title="The signal went quiet" body={error?.message ?? 'VEX could not read your latest focus record.'} />
          <ActionButton label="Retry score" onPress={() => refetch()} />
        </View>
      </VexRouteShell>
    );
  }

  if (isOffline) {
    return (
      <VexRouteShell atmosphere="analytics" eyebrow="Offline record" title="Focus Score" onBack={() => navigation.goBack()}>
        <View style={{ backgroundColor: vexFire.panel, borderColor: vexFire.borderStrong, borderRadius: borderRadius.lg, borderWidth: 1, padding: theme.spacing[5] }}>
          <TextBlock title="You are reading the saved signal" body="VEX will refresh this score when the connection returns." />
          <ActionButton label="Try again" onPress={() => refetch()} />
        </View>
      </VexRouteShell>
    );
  }

  if (!score) {
    return (
      <VexRouteShell atmosphere="analytics" eyebrow="First signal" title="Focus Score" subtitle="Your score appears after your first completed session." onBack={() => navigation.goBack()}>
        <View style={{ alignItems: 'center', backgroundColor: vexFire.panel, borderColor: vexFire.border, borderRadius: borderRadius.lg, borderWidth: 1, padding: theme.spacing[6] }}>
          <TextBlock title="Give VEX one honest block" body="Start a session, finish it, and your attention will leave its first trace here." />
          <ActionButton label="Start a session" onPress={() => navigation.navigate('Main', { screen: 'Focus' })} />
        </View>
      </VexRouteShell>
    );
  }

  const delta = score.currentScore - score.previousScore;
  const positiveFactor = score.topPositiveFactor ? score.factors[score.topPositiveFactor] : null;
  const negativeFactor = score.topNegativeFactor ? score.factors[score.topNegativeFactor] : null;

  return (
    <VexRouteShell atmosphere="analytics" eyebrow="Focus intelligence" title="Focus Score" subtitle="Your attention leaves a trace. VEX turns it into a pattern you can use." onBack={() => navigation.goBack()} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={vexFire.ember} />}>
      <View style={{ backgroundColor: vexFire.panel, borderColor: vexFire.borderStrong, borderRadius: borderRadius.lg, borderWidth: 1, marginBottom: theme.spacing[4], overflow: 'hidden', padding: theme.spacing[6] }}>
        <TextBlock eyebrow="Current reading" title={`${score.currentScore}`} body={score.band} />
        <Text style={{ color: delta >= 0 ? vexFire.success : vexFire.danger, fontSize: theme.typography.body.small.fontSize, fontWeight: '800', marginTop: theme.spacing[3] }}>{formatDelta(delta)} since last session</Text>
        {isRefetching ? <Text style={{ color: vexFire.textMuted, fontSize: theme.typography.ui.caption.fontSize, marginTop: theme.spacing[2] }}>Updating your signal…</Text> : null}
      </View>

      <Section title="Thirty-day trace">
        {history && history.length > 0 ? history.slice(-5).map((point) => (
          <View key={`point-${point.timestamp}`} style={{ borderBottomColor: vexFire.line, borderBottomWidth: 1, paddingVertical: theme.spacing[3] }}>
            <Text style={{ color: vexFire.textSecondary, fontSize: theme.typography.body.small.fontSize }}>{formatHistoryPoint(point)}</Text>
          </View>
        )) : <Text style={{ color: vexFire.textSecondary, fontSize: theme.typography.body.medium.fontSize }}>No history yet. The next completed block starts the trace.</Text>}
      </Section>

      <Section title="What moves it">
        {Object.entries(score.factors).map(([key, factor]) => (
          <View key={key} style={{ marginBottom: theme.spacing[4] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[2] }}>
              <Text style={{ color: vexFire.textSecondary, fontSize: theme.typography.body.small.fontSize }}>{key}</Text>
              <Text style={{ color: vexFire.amber, fontSize: theme.typography.body.small.fontSize, fontWeight: '800' }}>{factor.score}</Text>
            </View>
            <View style={{ backgroundColor: vexFire.backgroundSoft, borderRadius: borderRadius.full, height: theme.spacing[2], overflow: 'hidden' }}>
              <View style={{ backgroundColor: vexFire.ember, borderRadius: borderRadius.full, height: '100%', width: `${factor.score}%` }} />
            </View>
          </View>
        ))}
      </Section>

      <Section title="What changed">
        <Text style={{ color: vexFire.cream, fontSize: theme.typography.body.medium.fontSize, lineHeight: theme.typography.body.medium.lineHeight }}>{score.lastChangeReason}</Text>
        {positiveFactor ? <Text style={{ color: vexFire.success, fontSize: theme.typography.body.small.fontSize, marginTop: theme.spacing[3] }}>Strongest: {positiveFactor.explanation}</Text> : null}
        {negativeFactor ? <Text style={{ color: vexFire.danger, fontSize: theme.typography.body.small.fontSize, marginTop: theme.spacing[2] }}>Weakest: {negativeFactor.explanation}</Text> : null}
      </Section>

      <ActionButton label="Open analytics" onPress={() => navigation.navigate('Analytics')} />
    </VexRouteShell>
  );
}

function TextBlock({ eyebrow, title, body }: { eyebrow?: string; title: string; body: string }): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View>
      {eyebrow ? <Text style={{ color: vexFire.ember, fontSize: theme.typography.ui.overline.fontSize, fontWeight: '900', letterSpacing: 1.4 }}>{eyebrow.toUpperCase()}</Text> : null}
      <Text style={{ color: vexFire.cream, fontSize: theme.typography.heading.h2.fontSize, fontWeight: '900', marginTop: theme.spacing[2] }}>{title}</Text>
      <Text style={{ color: vexFire.textSecondary, fontSize: theme.typography.body.medium.fontSize, lineHeight: theme.typography.body.medium.lineHeight, marginTop: theme.spacing[2] }}>{body}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ backgroundColor: vexFire.panelSoft, borderColor: vexFire.border, borderRadius: borderRadius.lg, borderWidth: 1, marginBottom: theme.spacing[4], padding: theme.spacing[5] }}>
      <Text style={{ color: vexFire.amber, fontSize: theme.typography.ui.label.fontSize, fontWeight: '900', letterSpacing: 1.2, marginBottom: theme.spacing[2] }}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <Pressable accessibilityHint={`Opens ${label.toLowerCase()}`} accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={{ alignItems: 'center', backgroundColor: vexFire.ember, borderRadius: borderRadius.md, justifyContent: 'center', marginTop: theme.spacing[5], minHeight: theme.spacing[12], paddingHorizontal: theme.spacing[5] }}>
      <Text style={{ color: vexFire.background, fontSize: theme.typography.ui.button.fontSize, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

export const FocusScoreDashboard = withScreenErrorBoundary(FocusScoreDashboardInner, 'Focus Dashboard');
