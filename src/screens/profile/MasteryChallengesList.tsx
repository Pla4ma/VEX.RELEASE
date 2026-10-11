import React from 'react';
import { View } from 'react-native';
import { Box } from '../../components/primitives/Box';
import { Card } from '../../components/primitives/Card';
import { Text } from '../../components/primitives/Text';
import { Button } from '../../components/primitives/Button';
import { EmptyState } from '../../components/EmptyState';
import type { MasteryChallenge } from '../../features/mastery/types';
import { Icon } from '../../icons/components/Icon';
import { useTheme } from '../../theme/ThemeContext';
import { vexFire } from '@/theme/tokens/vex-fire';


const DIFFICULTY_COLORS = {
  EASY: vexFire.success,
  MEDIUM: vexFire.copper,
  HARD: vexFire.amber,
  ELITE: vexFire.ember,
};

function ChallengeCard({
  challenge,
  onClaim,
}: {
  challenge: MasteryChallenge;
  onClaim: () => void;
}): React.ReactNode {
  const { theme } = useTheme();
  const progress =
    challenge.target > 0
      ? Math.max(0, Math.min(1, challenge.current / challenge.target))
      : 0;
  const badgeColor = DIFFICULTY_COLORS[challenge.difficulty];
  return (
    <Card
      size="md"
      style={{ backgroundColor: vexFire.panel }}
    >
      <View style={{ gap: theme.spacing[3] }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flex: 1, gap: theme.spacing[1] }}>
            <Text variant="h4" color={vexFire.cream}>
              {challenge.title}
            </Text>
            <Text variant="caption" color={vexFire.textSecondary}>
              {challenge.description}
            </Text>
          </View>
          <View
            style={{
              borderRadius: 999,
              paddingHorizontal: theme.spacing[2],
              paddingVertical: theme.spacing[1],
              backgroundColor: `${badgeColor}22`,
            }}
          >
            <Text variant="caption" style={{ color: badgeColor }}>
              {challenge.difficulty}
            </Text>
          </View>
        </View>
        <View style={{ gap: theme.spacing[1] }}>
          <View
            style={{
              height: 8,
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: vexFire.backgroundSoft,
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: 8,
                borderRadius: 4,
                backgroundColor: badgeColor,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="caption" color={vexFire.textMuted}>
              {challenge.current}/{challenge.target} {challenge.unit}
            </Text>
            <Text variant="caption" color={vexFire.success}>
              +{challenge.masteryPoints} MP
            </Text>
          </View>
        </View>
        {challenge.status === 'COMPLETED' && (
          <Button
            size="sm"
            variant="primary"
            onPress={onClaim}
            accessibilityLabel={`Claim reward for ${challenge.title}`}
            accessibilityRole="button"
            accessibilityHint={`Claims ${challenge.masteryPoints} mastery points`}
          >
            <Text>Claim +{challenge.masteryPoints} MP</Text>
          </Button>
        )}
      </View>
    </Card>
  );
}

export function MasteryChallengesList({
  challenges,
  onClaim,
  onRefresh,
}: {
  challenges: MasteryChallenge[];
  onClaim: (id: string) => void;
  onRefresh: () => void;
}): React.ReactNode {
  const { theme } = useTheme();
  return (
    <>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text variant="h4" color={vexFire.cream}>
          Active Challenges
        </Text>
        <Button
          size="sm"
          variant="ghost"
          onPress={onRefresh}
          accessibilityLabel="Refresh challenges"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Icon
            name="refresh"
            size={16}
            color={vexFire.ember}
          />
        </Button>
      </Box>
      {challenges.length === 0 ? (
        <Card
          size="md"
          style={{ backgroundColor: vexFire.panel }}
        >
          <EmptyState
            iconName="target"
            title="No active challenges"
            body="Complete sessions to unlock mastery challenges"
          />
        </Card>
      ) : (
        <View style={{ gap: theme.spacing[3] }}>
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onClaim={() => onClaim(challenge.id)}
            />
          ))}
        </View>
      )}
    </>
  );
}
