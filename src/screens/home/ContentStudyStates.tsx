import React from 'react';
import { View } from 'react-native';
import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { LiquidButton } from '../../components/glass/LiquidButton';
import { Skeleton } from '../../components/ui/Skeleton';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import type { LearningExecutionCopy } from '../../features/learning-execution';

interface ContentStudyStatesProps {
  isLoading: boolean;
  hasError: boolean;
  copy: LearningExecutionCopy;
  onRetry: () => void;
  onSeeHowItWorks: () => void;
  onStart: () => void;
}

export function ContentStudyStates({
  isLoading,
  hasError,
  copy,
  onRetry,
  onSeeHowItWorks,
  onStart: _onStart,
}: ContentStudyStatesProps): JSX.Element | null {
  if (isLoading) {
    return (
      <GlassCard variant="premium" padding={20} radius={26}>
        <View style={{ gap: 10 }}>
          <Text style={{
            color: vexLightGlass.mint[700], fontSize: 11,
            fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase',
          }}>{copy.layerName}</Text>
          <Skeleton width={180} height={20} borderRadius={8} />
          <Skeleton width="100%" height={16} borderRadius={6} />
          <Skeleton width={132} height={40} borderRadius={12} />
        </View>
      </GlassCard>
    );
  }

  if (hasError) {
    return (
      <GlassCard variant="premium" padding={20} radius={26}>
        <View style={{ gap: 12 }}>
          <Text style={{
            color: vexLightGlass.mint[700], fontSize: 11,
            fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase',
          }}>{copy.layerName}</Text>
          <Text style={{
            color: vexLightGlass.text.primary, fontSize: 16,
            fontWeight: '800', letterSpacing: -0.2,
          }}>{copy.errorTitle}</Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <LiquidButton label={copy.errorCta} onPress={onRetry} variant="primary" />
            <LiquidButton label="See How It Works" onPress={onSeeHowItWorks} variant="outline" />
          </View>
        </View>
      </GlassCard>
    );
  }

  return null;
}
