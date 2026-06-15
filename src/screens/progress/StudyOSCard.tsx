import React from 'react';
import { View } from 'react-native';
import { LiquidButton } from '../../components/glass/LiquidButton';
import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { RealisticModeOrb } from '../../components/glass/RealisticModeOrb';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import type { MotivationProfile } from '../../features/liveops-config/feature-access-types';
import { getSessionsUntilStudyUnlock } from './services/progress-unlock-helpers';

type StudyOSCardProps = {
  canOpenStudy: boolean;
  completedSessions: number;
  motivationProfile?: MotivationProfile | null;
  onOpenStudy: () => void;
};

export function StudyOSCard({
  canOpenStudy,
  completedSessions,
  motivationProfile,
  onOpenStudy,
}: StudyOSCardProps): React.ReactNode {
  const sessionsRemaining = getSessionsUntilStudyUnlock(
    completedSessions,
    motivationProfile,
  );

  return (
    <GlassCard variant="default" padding={12} radius={18}>
      <View pointerEvents="none" style={{ backgroundColor: vexLightGlass.background.atmosphericMint, borderRadius: 200, height: 112, position: 'absolute', right: -40, top: -40, width: 112 }} />
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 10,
          justifyContent: 'space-between',
        }}
      >
        <RealisticModeOrb mode="study" size={48} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text
            style={{
              color: vexLightGlass.mint[700],
              fontSize: 12,
              fontWeight: '700',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            Study OS
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 14,
              fontWeight: '800',
              letterSpacing: -0.3,
              lineHeight: 18,
            }}
          >
            {canOpenStudy
              ? 'Turn material into focus sessions'
              : sessionsRemaining === 1
                ? 'Study tools unlock in 1 session'
                : `Study tools unlock in ${sessionsRemaining} sessions`}
          </Text>
        </View>
      </View>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 12,
          lineHeight: 15,
          marginTop: 6,
        }}
      >
        Plans, review, and quizzes stay tied to the same start and complete loop.
      </Text>
      <View style={{ marginTop: 8, maxWidth: 160 }}>
        <LiquidButton
          label={canOpenStudy ? 'Open study tools' : 'Start session'}
          onPress={onOpenStudy}
          variant={canOpenStudy ? 'primary' : 'outline'}
          size="sm"
          accessibilityLabel={
            canOpenStudy
              ? 'Open study tools'
              : `Start session to unlock study tools in ${sessionsRemaining} sessions`
          }
          accessibilityHint="Moves you to the next study or focus action"
        />
      </View>
    </GlassCard>
  );
}
