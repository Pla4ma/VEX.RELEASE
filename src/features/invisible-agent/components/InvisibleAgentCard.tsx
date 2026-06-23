import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { CoachAgentDecision } from '../schemas';

interface InvisibleAgentCardProps {
  decision: CoachAgentDecision | null;
  isPending: boolean;
  isError: boolean;
  onConfirm: (decision: CoachAgentDecision) => void;
  onRetry: () => void;
}

export function InvisibleAgentCard({
  decision,
  isPending,
  isError,
  onConfirm,
  onRetry,
}: InvisibleAgentCardProps): React.ReactNode {
  if (isPending) {
    return <Frame title="VEX Agent" body="Reading today’s context..." />;
  }
  if (isError) {
    return (
      <Frame
        title="VEX Agent paused"
        body="Could not load the safe next action."
        ctaLabel="Try again"
        onPress={onRetry}
      />
    );
  }
  if (!decision) {return null;}
  return (
    <Frame
      title={titleFor(decision)}
      body={decision.message}
      meta={`${Math.round(decision.confidence * 100)}% confidence · confirmation required`}
      ctaLabel={ctaFor(decision)}
      onPress={() => onConfirm(decision)}
    />
  );
}

function Frame({
  title,
  body,
  meta,
  ctaLabel,
  onPress,
}: {
  title: string;
  body: string;
  meta?: string;
  ctaLabel?: string;
  onPress?: () => void;
}): React.ReactNode {
  return (
    <GlassCard variant="premium" padding={spacing[5]} radius={28} glowMint>
      <View style={{ gap: spacing[3] }}>
        <Text style={{ color: vexLightGlass.mint[700], fontSize: 12, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Invisible Agent
        </Text>
        <Text style={{ color: vexLightGlass.text.primary, fontSize: 20, fontWeight: '900', letterSpacing: -0.4 }}>
          {title}
        </Text>
        <Text style={{ color: vexLightGlass.text.secondary, fontSize: 14, lineHeight: 21 }}>
          {body}
        </Text>
        {meta ? (
          <Text style={{ color: vexLightGlass.text.tertiary, fontSize: 12 }}>
            {meta}
          </Text>
        ) : null}
        {ctaLabel && onPress ? (
          <LiquidButton
            label={ctaLabel}
            onPress={onPress}
            variant="primary"
            fullWidth
            accessibilityLabel={ctaLabel}
            accessibilityHint="Confirms the safe agent recommendation"
          />
        ) : null}
      </View>
    </GlassCard>
  );
}

function titleFor(decision: CoachAgentDecision): string {
  if (decision.type === 'NO_ACTION') {return 'No push today';}
  if (decision.type === 'RESCUE_STREAK') {return 'Rescue window open';}
  if (decision.type === 'CONTINUE_STUDY_PLAN') {return 'Study thread ready';}
  if (decision.type === 'REVIEW_PROGRESS') {return 'Review progress';}
  return 'Best next move';
}

function ctaFor(decision: CoachAgentDecision): string {
  if (decision.type === 'NO_ACTION') {return 'Review progress';}
  if (decision.type === 'RESCUE_STREAK') {return 'Start rescue';}
  if (decision.type === 'CONTINUE_STUDY_PLAN') {return 'Continue study';}
  if (decision.type === 'REVIEW_PROGRESS') {return 'Open progress';}
  return 'Start session';
}
