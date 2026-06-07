import React from 'react';
import { View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { LiquidButton } from '../../components/glass/LiquidButton';
import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

export function RecentSessionsEmpty({
  isFirstRun,
  onStart,
}: {
  isFirstRun: boolean;
  onStart: () => void;
}): JSX.Element {
  if (isFirstRun) {
    return (
      <GlassCard variant="default" padding={20} radius={24}>
        <View style={{ gap: 10 }}>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 18,
              fontWeight: '800',
              letterSpacing: -0.2,
            }}
          >
            One session changes what you see here
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            Start a focus session or study from content. VEX will build your
            recent activity from real sessions.
          </Text>
          <View style={{ marginTop: 6 }}>
            <LiquidButton
              label="Start session"
              onPress={onStart}
              variant="primary"
              fullWidth
              accessibilityLabel="Start session"
              accessibilityHint="Double tap to activate"
            />
          </View>
        </View>
      </GlassCard>
    );
  }
  return (
    <GlassCard variant="default" padding={20} radius={24}>
      <EmptyState
        iconName="clock"
        title="No sessions yet"
        body="Start a focus session. VEX builds your activity feed from what you actually finish."
        actionLabel="Start session"
        onAction={onStart}
      />
    </GlassCard>
  );
}
