import React from 'react';
import { View } from 'react-native';
import { LiquidButton } from '../../components/glass/LiquidButton';
import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { RealisticModeOrb } from '../../components/glass/RealisticModeOrb';
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
  const sessionsRemaining = getSessionsUntilStudyUnlock(completedSessions, motivationProfile);

  return (
    <GlassCard variant="default" padding={12} radius={18}>
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
          <Text color="primary.500" variant="label">Study OS</Text>
          <Text variant="h4">
            {canOpenStudy
              ? 'Turn material into focus sessions'
              : sessionsRemaining === 1
                ? 'Study tools unlock in 1 session'
                : `Study tools unlock in ${sessionsRemaining} sessions`}
          </Text>
        </View>
      </View>
      <Text color="text.secondary" variant="bodySmall" style={{ marginTop: 6 }}>
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
