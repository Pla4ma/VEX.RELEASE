import React from 'react';
import { ScrollView, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useTheme } from '../../../theme';
import { useSquadMissions } from '../competitive-hooks';

type SquadMissionCardProps = { squadId?: string };

const personalMissions = [
  {
    id: 'personal-sessions-week',
    title: 'Solo Push',
    description: 'Complete 5 sessions this week.',
    targetMinutes: 5,
    currentMinutes: 0,
    status: 'ACTIVE',
    rewardPerMember: { value: '+500 coins' },
  },
  {
    id: 'personal-focus-hours',
    title: 'Three-Hour Mark',
    description: 'Bank 180 focused minutes on your own.',
    targetMinutes: 180,
    currentMinutes: 0,
    status: 'ACTIVE',
    rewardPerMember: { value: '+250 XP' },
  },
  {
    id: 'personal-perfect-session',
    title: 'Clean Rep',
    description: 'Finish one 90+ purity session.',
    targetMinutes: 1,
    currentMinutes: 0,
    status: 'ACTIVE',
    rewardPerMember: { value: '+100 coins' },
  },
] as const;

function getMissionIcon(missionId: string) {
  if (missionId.includes('collective-hours')) {return '⏱️';}
  if (missionId.includes('perfect-sessions')) {return '🎯';}
  return '🔥';
}

export function SquadMissionCard({ squadId }: SquadMissionCardProps): JSX.Element {
  const { theme } = useTheme();
  const query = useSquadMissions(squadId);
  const missions = squadId ? query.data ?? [] : personalMissions;

  return (
    <View style={{ gap: theme.spacing[3] }}>
      <View>
        <Text variant="label" color={theme.colors.primary[500]}>{squadId ? 'Squad Missions' : 'Personal Missions'}</Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          {squadId ? 'Three shared wins live at all times.' : 'Solo missions now. Team pressure when you join a squad.'}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing[3] }}>
        {squadId && query.error instanceof Error ? (
          <View style={{ width: 220, borderWidth: 1, borderColor: theme.colors.error.DEFAULT, borderRadius: theme.borderRadius['2xl'], padding: theme.spacing[4], backgroundColor: theme.colors.background.secondary }}>
            <Text variant="bodySmall" color={theme.colors.error.DEFAULT}>{query.error.message}</Text>
          </View>
        ) : squadId && query.isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <View
                key={`mission-skeleton-${index}`}
                style={{
                  width: 220,
                  borderWidth: 1,
                  borderColor: theme.colors.border.light,
                  borderRadius: theme.borderRadius['2xl'],
                  padding: theme.spacing[4],
                  gap: theme.spacing[3],
                  backgroundColor: theme.colors.background.secondary,
                }}
              >
                <Skeleton width={30} height={30} variant="circular" />
                <Skeleton width="70%" height={16} />
                <Skeleton width="100%" height={8} borderRadius={999} />
                <Skeleton width="80%" height={14} />
              </View>
            ))
          : missions.map((mission) => {
              const progress = Math.max(0, Math.min(100, (mission.currentMinutes / Math.max(1, mission.targetMinutes)) * 100));
              const complete = mission.status !== 'ACTIVE';
              return (
                <View
                  key={mission.id}
                  style={{
                    width: 220,
                    borderWidth: 1,
                    borderColor: complete ? theme.colors.success.DEFAULT : theme.colors.border.light,
                    borderRadius: theme.borderRadius['2xl'],
                    padding: theme.spacing[4],
                    gap: theme.spacing[3],
                    backgroundColor: theme.colors.background.secondary,
                    overflow: 'hidden',
                  }}
                >
                  {complete ? (
                    <View style={{ position: 'absolute', top: theme.spacing[3], right: theme.spacing[3] }}>
                      <Text variant="label" color={theme.colors.success.DEFAULT}>✓ Claimed</Text>
                    </View>
                  ) : null}
                  <Text style={{ fontSize: 24 }}>{getMissionIcon(mission.id)}</Text>
                  <View style={{ gap: theme.spacing[1] }}>
                    <Text variant="h4" color={theme.colors.text.primary}>{mission.title}</Text>
                    <Text variant="bodySmall" color={theme.colors.text.secondary}>{mission.description}</Text>
                  </View>
                  <View style={{ gap: theme.spacing[1] }}>
                    <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.colors.background.tertiary, overflow: 'hidden' }}>
                      <View style={{ width: `${progress}%`, height: '100%', backgroundColor: complete ? theme.colors.success.DEFAULT : theme.colors.primary[500] }} />
                    </View>
                    <Text variant="caption" color={theme.colors.text.secondary}>{`${mission.currentMinutes}/${mission.targetMinutes}`}</Text>
                  </View>
                  <Text variant="label" color={theme.colors.primary[500]}>{String(mission.rewardPerMember.value)}</Text>
                  {!squadId ? (
                    <Text variant="caption" color={theme.colors.text.secondary}>Join a squad to make this a team mission</Text>
                  ) : null}
                </View>
              );
            })}
      </ScrollView>
    </View>
  );
}

