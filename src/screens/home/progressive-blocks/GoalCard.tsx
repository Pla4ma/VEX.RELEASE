import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { UserExperienceStage } from '../../../features/liveops-config';

const GOAL_COPY: Record<UserExperienceStage, { title: string; body: string }> =
  {
    NEW_USER: {
      title: 'Start with one clean finish',
      body: 'One completed session makes VEX feel real. The app stays intentionally quiet until then.',
    },
    ACTIVATING: {
      title: 'Protect the habit first',
      body: 'Build momentum before exploring extras. The social and boss layers unlock naturally.',
    },
    ENGAGED: {
      title: 'Deepen your momentum',
      body: 'Your next session should build on your streak, not just maintain it.',
    },
    POWER_USER: {
      title: 'Master your focus rhythm',
      body: 'Use the full VEX toolkit when it serves you. Keep the core habit strong.',
    },
  };

export function GoalCard({ stage }: { stage: UserExperienceStage }) {
  const copy = GOAL_COPY[stage];

  return (
    <GlassCard variant="default" padding={16} radius={22}>
      <View style={{ gap: 6 }}>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Today&apos;s Focus
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 18,
            fontWeight: '800',
            letterSpacing: -0.2,
          }}
        >
          {copy.title}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 13,
            lineHeight: 19,
          }}
        >
          {copy.body}
        </Text>
      </View>
    </GlassCard>
  );
}
