import React from 'react';
import { Image, Pressable, View } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';

import { Skeleton } from '../../../components/ui/Skeleton';
import { Text } from '../../../components/primitives/Text';
import { VexSurface } from '../../../shared/ui/vex/VexSurface';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';
import type { CoachAgentDecision } from '../../../features/invisible-agent';
import { homeAgentActionLabel } from '../services/home-agent-action';

const ATLAS = require('../../../../assets/vex/study/ai-study-atlas.png');
const AGENT = require('../../../../assets/vex/coach/coach-artifact.png');

type HomeAgentSignalCardProps = {
  query: UseQueryResult<CoachAgentDecision>;
  onConfirm: (decision: CoachAgentDecision) => void;
  onOpenCoach: () => void;
};

export function HomeAgentSignalCard({ query, onConfirm, onOpenCoach }: HomeAgentSignalCardProps): React.JSX.Element {
  const { theme } = useTheme();
  if (query.isPending) {
    return <VexSurface tone="quiet" style={{ marginBottom: theme.spacing[5], padding: theme.spacing[4] }}><View style={{ gap: theme.spacing[3] }}><Skeleton height={theme.spacing[4]} width="42%" /><Skeleton height={theme.spacing[4]} width="88%" /><Skeleton height={theme.spacing[12]} width="100%" /></View></VexSurface>;
  }
  if (query.isError) {
    return <VexSurface tone="quiet" style={{ marginBottom: theme.spacing[5], padding: theme.spacing[4] }}><Text color={vexFire.ember} variant="label">VEX AGENT PAUSED</Text><Text color={vexFire.textSecondary} mt="sm" variant="body">The next-action signal did not load. Your focus tools are still ready.</Text><Pressable accessibilityHint="Retries the VEX next-action signal" accessibilityLabel="Retry VEX agent" accessibilityRole="button" onPress={() => { void query.refetch(); }} style={{ alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing[3], minHeight: theme.spacing[12] }}><Text color={vexFire.amber} variant="button">Try again</Text></Pressable></VexSurface>;
  }
  const decision = query.data;
  if (!decision) {
    return <VexSurface tone="quiet" style={{ marginBottom: theme.spacing[5], padding: theme.spacing[4] }}><Text color={vexFire.textMuted} variant="label">VEX AGENT</Text><Text color={vexFire.cream} mt="sm" variant="body">VEX is calibrating your next clean move.</Text><Pressable accessibilityHint="Opens the AI Coach conversation" accessibilityLabel="Ask VEX for a plan" accessibilityRole="button" onPress={onOpenCoach} style={{ alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing[3], minHeight: theme.spacing[12] }}><Text color={vexFire.amber} variant="button">Ask VEX</Text></Pressable></VexSurface>;
  }
  return <VexSurface tone="quiet" style={{ marginBottom: theme.spacing[5], overflow: 'hidden', padding: theme.spacing[4] }}>
    <Image accessibilityIgnoresInvertColors accessibilityLabel="VEX agent atlas" resizeMode="cover" source={ATLAS} style={{ bottom: 0, opacity: 0.15, position: 'absolute', right: 0, top: 0, width: '52%' }} />
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[3] }}><Image accessibilityIgnoresInvertColors accessibilityLabel="VEX Coach artifact" resizeMode="contain" source={AGENT} style={{ height: theme.spacing[12], width: theme.spacing[12] }} /><View style={{ flex: 1, gap: theme.spacing[1] }}><Text color={vexFire.ember} variant="label">VEX AGENT / CONFIRMATION REQUIRED</Text><Text color={vexFire.cream} variant="bodyLarge">{decision.message}</Text><Text color={vexFire.textMuted} variant="caption">{Math.round(decision.confidence * 100)}% confidence · evidence-backed suggestion</Text></View></View>
    <Pressable accessibilityHint="Confirms the VEX agent recommendation" accessibilityLabel={homeAgentActionLabel(decision)} accessibilityRole="button" onPress={() => onConfirm(decision)} style={({ pressed }) => ({ alignItems: 'center', backgroundColor: pressed ? vexFire.copper : vexFire.ember, borderRadius: theme.borderRadius.lg, justifyContent: 'center', marginTop: theme.spacing[4], minHeight: theme.spacing[12], opacity: pressed ? 0.82 : 1 })}><Text color={vexFire.background} variant="button">{homeAgentActionLabel(decision)}</Text></Pressable>
  </VexSurface>;
}
