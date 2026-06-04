import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { Text, ProgressBar } from '../../../components';
import type { PersonalQuest } from '../recommendation/PersonalQuestGenerator';
import { getQuestIcon, formatTimeRemaining } from './questCardHelpers';
import { buttonTap } from '../../../utils/haptics';

interface DailyQuestCardProps {
  quest: PersonalQuest | null;
  coachName: string;
  onPress?: () => void;
}

export function DailyQuestCard({
  quest,
  coachName,
  onPress,
}: DailyQuestCardProps): JSX.Element {
  const { theme } = useTheme();

  const progressPercent = quest
    ? Math.min(100, Math.round((quest.current / quest.target) * 100))
    : 0;

  const isCompleted = quest ? quest.current >= quest.target : false;

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      style={{
        marginHorizontal: theme.spacing[4],
        marginTop: theme.spacing[4],
        marginBottom: theme.spacing[2],
        backgroundColor: isCompleted
          ? theme.colors.success[500] + '15'
          : theme.colors.primary[500] + '10',
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: isCompleted
          ? theme.colors.success[500]
          : theme.colors.primary[500],
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={() => { buttonTap(); onPress?.(); }}
        disabled={!onPress}
        accessibilityLabel={`Daily quest: ${quest?.title ?? 'Loading'}`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view quest details"
      >
        <View style={{ padding: theme.spacing[4] }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing[2],
              marginBottom: theme.spacing[3],
            }}
          >
            <Text fontSize={24}>{quest ? getQuestIcon(quest.type) : ''}</Text>
            <View style={{ flex: 1 }}>
              <Text
                variant="h3"
                color={isCompleted ? 'success' : 'primary'}
                style={{ marginBottom: 2 }}
              >
                {isCompleted ? 'Quest Complete' : "Today's Quest"}
              </Text>
              <Text variant="caption" color="secondary">
                {`From ${coachName}`}
              </Text>
            </View>
            {isCompleted && (
              <View
                style={{
                  backgroundColor: theme.colors.success[500],
                  borderRadius: theme.borderRadius.full,
                  paddingHorizontal: theme.spacing[2],
                  paddingVertical: theme.spacing[1],
                }}
              >
                <Text
                  style={{
                    color: theme.colors.background.primary,
                    fontWeight: '600',
                  }}
                >
                  Done
                </Text>
              </View>
            )}
          </View>

          {/* Quest Content */}
          {quest ? (
            <>
              <Text variant="h4" style={{ marginBottom: theme.spacing[1] }}>
                {quest.title}
              </Text>
              <Text
                variant="body"
                color="secondary"
                style={{ marginBottom: theme.spacing[3], lineHeight: 20 }}
              >
                {quest.description}
              </Text>

              {/* Progress */}
              <View style={{ marginBottom: theme.spacing[2] }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: theme.spacing[1],
                  }}
                >
                  <Text variant="caption" color="secondary">
                    Progress
                  </Text>
                  <Text variant="caption" color="primary" weight="semibold">
                    {quest.current}/{quest.target} {quest.unit}
                  </Text>
                </View>
                <ProgressBar
                  progress={progressPercent / 100}
                  fillColor={
                    isCompleted
                      ? theme.colors.success[500]
                      : theme.colors.primary[500]
                  }
                  height={8}
                />
              </View>

              {/* Footer */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: theme.spacing[2],
                  paddingTop: theme.spacing[2],
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.border.light,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing[1],
                  }}
                >
                  <Text fontSize={14}></Text>
                  <Text variant="caption" color="secondary">
                    {quest.rewardXp} XP
                  </Text>
                </View>
                <Text variant="caption" color="secondary">
                  {formatTimeRemaining(quest.expiresAt)} remaining
                </Text>
              </View>
            </>
          ) : (
            <View
              style={{
                alignItems: 'center',
                paddingVertical: theme.spacing[4],
              }}
            >
              <Text
                variant="body"
                color="secondary"
                style={{ textAlign: 'center', marginBottom: theme.spacing[2] }}
              >
                No quest today — {coachName} is analyzing your patterns
              </Text>
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: theme.colors.primary[500] + '30',
                  borderRadius: theme.borderRadius.full,
                }}
              />
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
