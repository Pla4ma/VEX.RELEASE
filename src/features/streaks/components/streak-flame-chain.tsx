import { lightColors } from '@/theme/tokens/colors';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { styles } from './streak-flame-chain.styles';
import {
  getRiskColor,
  getFlameColor,
  getMilestoneReward,
} from './streak-flame-chain.utils';

interface StreakFlameChainProps {
  currentStreak: number;
  longestStreak: number;
  isAtRisk: boolean;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  streakDays: Array<{
    date: string;
    completed: boolean;
    hasMilestone?: boolean;
  }>;
}

export const StreakFlameChain: React.FC<StreakFlameChainProps> = ({
  currentStreak,
  longestStreak,
  isAtRisk,
  riskLevel,
  streakDays,
}) => {
  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    if (isAtRisk) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
        true,
      );
    } else {
      pulseAnim.value = withTiming(1, { duration: 120 });
    }
  }, [isAtRisk, pulseAnim]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const renderDayNode = (
    day: (typeof streakDays)[0],
    index: number,
  ) => {
    const isCompleted = day.completed;
    const isToday = index === streakDays.length - 1;
    const [flameColor1] = getFlameColor(index, isCompleted);
    const hasMilestone = day.hasMilestone;
    return (
      <Animated.View
        key={day.date}
        style={[
          styles.dayNode,
          isCompleted && isAtRisk ? pulseStyle : undefined,
        ]}
      >
        <View
          style={[
            styles.dayCircle,
            isCompleted && {
              backgroundColor: flameColor1,
              shadowColor: flameColor1,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              elevation: 8,
            },
            !isCompleted && styles.inactiveCircle,
            isToday && styles.todayCircle,
          ]}
        >
          <Text
            style={[styles.dayNumber, isCompleted && styles.activeDayNumber]}
          >
            {index + 1}
          </Text>
          {isCompleted && (
            <View style={styles.flameIcon}>
              <Text style={styles.flameEmoji}>🔥</Text>
            </View>
          )}
          {hasMilestone && (
            <View style={styles.milestoneBadge}>
              <Text style={styles.milestoneEmoji}>⭐</Text>
            </View>
          )}
        </View>
        {index < streakDays.length - 1 &&
          isCompleted &&
          streakDays[index + 1]?.completed && (
            <View
              style={[styles.connector, { backgroundColor: flameColor1 }]}
            />
          )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{currentStreak}</Text>
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakLabel}>Day Streak</Text>
          <Text style={styles.longestText}>Best: {longestStreak} days</Text>
        </View>
        {isAtRisk && (
          <Animated.View style={[styles.riskBadge, pulseStyle]}>
            <Text style={styles.riskEmoji}>⚠️</Text>
            <Text style={[styles.riskText, { color: getRiskColor(riskLevel) }]}>
              AT RISK
            </Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(currentStreak / Math.max(longestStreak, 30)) * 100}%`,
                backgroundColor: isAtRisk
                  ? getRiskColor(riskLevel)
                  : lightColors.semantic.warning,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round((currentStreak / Math.max(longestStreak, 30)) * 100)}% to
          record
        </Text>
      </View>

      <View style={styles.chainContainer}>
        {streakDays.map((day, index) => renderDayNode(day, index))}
      </View>

      {(() => {
        const milestones = [3, 7, 14, 30, 60, 100, 180, 365];
        const nextMilestone = milestones.find((m) => m > currentStreak);
        if (nextMilestone) {
          const remaining = nextMilestone - currentStreak;
          return (
            <View style={styles.milestoneCard}>
              <Text style={styles.milestoneEmojiSmall}>🎯</Text>
              <Text style={styles.milestoneText}>
                {remaining} day{remaining !== 1 ? 's' : ''} until{' '}
                {nextMilestone}-day milestone!
              </Text>
              <Text style={styles.milestoneReward}>
                Reward: {getMilestoneReward(nextMilestone)}
              </Text>
            </View>
          );
        }
        return null;
      })()}
    </View>
  );
};
