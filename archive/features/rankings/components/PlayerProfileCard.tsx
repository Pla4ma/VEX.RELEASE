/**
 * Player Profile Card Component
 *
 * Phase 16.2 - Player profile card for leaderboard interactions.
 *
 * Features:
 * - Shows avatar, username, level, prestige badge
 * - Streak, total focus hours, recent sessions
 * - Achievement count, mutual squad
 * - "Add as Rival" button
 * - "View Squad" button if public squad
 */

import React, { useState, useCallback } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../../theme';
import { Box, Text, Card } from '../../../components/primitives';
import { Icon } from '../../../icons';
import { useUIStore } from '../../../store';

export interface PlayerProfile {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  prestigeBadge: string | null;
  streak: number;
  totalFocusHours: number;
  totalSessions: number;
  achievementCount: number;
  mutualSquad: string | null;
  isRival: boolean;
  recentSessions: Array<{
    id: string;
    duration: number;
    timestamp: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  }>;
}

interface PlayerProfileCardProps {
  profile: PlayerProfile | null;
  visible: boolean;
  onClose: () => void;
  onAddRival?: (userId: string) => void;
  onViewSquad?: (squadId: string) => void;
  style?: ViewStyle;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {return `${days}d ago`;}
  if (hours > 0) {return `${hours}h ago`;}
  return 'Just now';
};

const getQualityColor = (quality: string): string => {
  switch (quality) {
    case 'excellent':
      return '#10B981';
    case 'good':
      return '#3B82F6';
    case 'fair':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

export const PlayerProfileCard: React.FC<PlayerProfileCardProps> = ({
  profile,
  visible,
  onClose,
  onAddRival,
  onViewSquad,
  style,
}) => {
  const { theme } = useTheme();
  const { showToast } = useUIStore();
  const [isAddingRival, setIsAddingRival] = useState(false);

  const slideUp = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (visible) {
      slideUp.value = withSpring(1, { damping: 15 });
    } else {
      slideUp.value = 0;
    }
  }, [visible, slideUp]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: (1 - slideUp.value) * 300,
      },
    ],
  }));

  const handleAddRival = useCallback(async () => {
    if (!profile) {return;}

    setIsAddingRival(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsAddingRival(false);
    onAddRival?.(profile.userId);

    showToast({
      message: `Added ${profile.displayName} as a rival!`,
      type: 'success',
      duration: 3000,
    });
  }, [profile, onAddRival, showToast]);

  const handleViewSquad = useCallback(() => {
    if (profile?.mutualSquad) {
      onViewSquad?.(profile.mutualSquad);
    }
  }, [profile, onViewSquad]);

  if (!profile) {return null;}

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Box
        flex={1}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control"/>

        <Animated.View style={[modalStyle, style]}>
          <Card
            size="lg"
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              maxHeight: '90%',
            }}
          >
            {/* Handle */}
            <Box alignItems="center" mb={16}>
              <Box
                width={40}
                height={4}
                borderRadius={2}
                style={{ backgroundColor: theme.colors.border.DEFAULT }}
              />
            </Box>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Header */}
              <Box alignItems="center" mb={24}>
                {/* Avatar */}
                <Box
                  width={100}
                  height={100}
                  borderRadius={50}
                  justifyContent="center"
                  alignItems="center"
                  mb={16}
                  style={{
                    backgroundColor: profile.avatarUrl
                      ? theme.colors.background.tertiary
                      : theme.colors.primary[100],
                    borderWidth: 4,
                    borderColor: theme.colors.primary[500],
                    shadowColor: theme.colors.primary[500],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 5,
                  }}
                >
                  {profile.avatarUrl ? (
                    <Text style={{ fontSize: 50 }}>👤</Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 40,
                        fontWeight: '700',
                        color: theme.colors.primary[600],
                      }}
                    >
                      {profile.displayName.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </Box>

                {/* Name */}
                <Text variant="h2" style={{ marginBottom: 8 }}>
                  {profile.displayName}
                </Text>

                {/* Level & Prestige */}
                <Box flexDirection="row" alignItems="center">
                  <Box
                    px={12}
                    py={6}
                    borderRadius={8}
                    style={{ backgroundColor: theme.colors.primary[50] }}
                  >
                    <Text
                      style={{
                        fontWeight: '700',
                        fontSize: 14,
                        color: theme.colors.primary[600],
                      }}
                    >
                      Level {profile.level}
                    </Text>
                  </Box>

                  {profile.prestigeBadge && (
                    <Box
                      ml={10}
                      px={12}
                      py={6}
                      borderRadius={8}
                      style={{ backgroundColor: '#F59E0B' + '20' }}
                    >
                      <Box flexDirection="row" alignItems="center">
                        <Icon name="crown" size={14} color="#F59E0B" />
                        <Text
                          style={{
                            fontWeight: '700',
                            fontSize: 14,
                            color: '#F59E0B',
                            marginLeft: 6,
                          }}
                        >
                          {profile.prestigeBadge}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Stats Grid */}
              <Box flexDirection="row" flexWrap="wrap" mb={24} style={{ gap: 12 }}>
                {/* Streak */}
                <Box flex={1} minWidth={100}>
                  <Card size="sm" style={{ alignItems: 'center', padding: 16 }}>
                    <Box
                      width={44}
                      height={44}
                      borderRadius={22}
                      justifyContent="center"
                      alignItems="center"
                      mb={8}
                      style={{ backgroundColor: theme.colors.error[50] }}
                    >
                      <Icon name="flame" size={22} color={theme.colors.error.DEFAULT} />
                    </Box>
                    <Text variant="h3" style={{ color: theme.colors.error.DEFAULT }}>
                      {profile.streak}
                    </Text>
                    <Text variant="caption" color="text.secondary">
                      Day Streak
                    </Text>
                  </Card>
                </Box>

                {/* Focus Hours */}
                <Box flex={1} minWidth={100}>
                  <Card size="sm" style={{ alignItems: 'center', padding: 16 }}>
                    <Box
                      width={44}
                      height={44}
                      borderRadius={22}
                      justifyContent="center"
                      alignItems="center"
                      mb={8}
                      style={{ backgroundColor: theme.colors.success[50] || '#ECFDF5' }}
                    >
                      <Icon name="clock" size={22} color={theme.colors.success.DEFAULT} />
                    </Box>
                    <Text variant="h3" style={{ color: theme.colors.success.DEFAULT }}>
                      {Math.floor(profile.totalFocusHours)}
                    </Text>
                    <Text variant="caption" color="text.secondary">
                      Hours Focused
                    </Text>
                  </Card>
                </Box>

                {/* Sessions */}
                <Box flex={1} minWidth={100}>
                  <Card size="sm" style={{ alignItems: 'center', padding: 16 }}>
                    <Box
                      width={44}
                      height={44}
                      borderRadius={22}
                      justifyContent="center"
                      alignItems="center"
                      mb={8}
                      style={{ backgroundColor: theme.colors.primary[50] }}
                    >
                      <Icon name="target" size={22} color={theme.colors.primary[500]} />
                    </Box>
                    <Text variant="h3" style={{ color: theme.colors.primary[500] }}>
                      {profile.totalSessions}
                    </Text>
                    <Text variant="caption" color="text.secondary">
                      Sessions
                    </Text>
                  </Card>
                </Box>

                {/* Achievements */}
                <Box flex={1} minWidth={100}>
                  <Card size="sm" style={{ alignItems: 'center', padding: 16 }}>
                    <Box
                      width={44}
                      height={44}
                      borderRadius={22}
                      justifyContent="center"
                      alignItems="center"
                      mb={8}
                      style={{ backgroundColor: '#8B5CF6' + '15' }}
                    >
                      <Icon name="award" size={22} color="#8B5CF6" />
                    </Box>
                    <Text variant="h3" style={{ color: '#8B5CF6' }}>
                      {profile.achievementCount}
                    </Text>
                    <Text variant="caption" color="text.secondary">
                      Achievements
                    </Text>
                  </Card>
                </Box>
              </Box>

              {/* Recent Sessions */}
              <Box mb={24}>
                <Text
                  variant="caption"
                  color="text.secondary"
                  style={{ marginLeft: 4, marginBottom: 12, fontWeight: '600' }}
                >
                  RECENT SESSIONS
                </Text>

                <Card size="sm" style={{ overflow: 'hidden' }}>
                  {profile.recentSessions.length === 0 ? (
                    <Box p={20} alignItems="center">
                      <Text variant="caption" color="text.secondary">
                        No recent sessions
                      </Text>
                    </Box>
                  ) : (
                    profile.recentSessions.map((session, index) => (
                      <Box key={session.id}>
                        <Box
                          flexDirection="row"
                          alignItems="center"
                          p={16}
                        >
                          {/* Quality Indicator */}
                          <Box
                            width={12}
                            height={12}
                            borderRadius={6}
                            style={{
                              backgroundColor: getQualityColor(session.quality),
                            }}
                          />

                          {/* Duration */}
                          <Box flex={1} ml={12}>
                            <Text variant="body" style={{ fontWeight: '600' }}>
                              {formatDuration(session.duration)}
                            </Text>
                            <Text variant="caption" color="text.secondary">
                              {formatTimeAgo(session.timestamp)}
                            </Text>
                          </Box>

                          {/* Quality Label */}
                          <Box
                            px={10}
                            py={4}
                            borderRadius={6}
                            style={{
                              backgroundColor: getQualityColor(session.quality) + '15',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: '600',
                                textTransform: 'capitalize',
                                color: getQualityColor(session.quality),
                              }}
                            >
                              {session.quality}
                            </Text>
                          </Box>
                        </Box>

                        {index < profile.recentSessions.length - 1 && (
                          <Box
                            height={1}
                            ml={40}
                            style={{ backgroundColor: theme.colors.border.light }}
                          />
                        )}
                      </Box>
                    ))
                  )}
                </Card>
              </Box>

              {/* Mutual Squad */}
              {profile.mutualSquad && (
                <Box mb={16}>
                  <Pressable onPress={handleViewSquad}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                    <Card
                      size="sm"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box flexDirection="row" alignItems="center">
                        <Box
                          width={44}
                          height={44}
                          borderRadius={12}
                          justifyContent="center"
                          alignItems="center"
                          style={{ backgroundColor: theme.colors.primary[50] }}
                        >
                          <Icon name="users" size={20} color={theme.colors.primary[500]} />
                        </Box>
                        <Box ml={12}>
                          <Text variant="body" style={{ fontWeight: '600' }}>
                            Mutual Squad
                          </Text>
                          <Text variant="caption" color="text.secondary">
                            {profile.mutualSquad}
                          </Text>
                        </Box>
                      </Box>
                      <Icon name="arrow-right" size={20} color={theme.colors.text.tertiary} />
                    </Card>
                  </Pressable>
                </Box>
              )}

              {/* Action Buttons */}
              <Box mb={40}>
                {!profile.isRival ? (
                  <Pressable
                    onPress={handleAddRival}
                    disabled={isAddingRival}
                    style={{
                      backgroundColor: '#EF4444',
                      paddingVertical: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      opacity: isAddingRival ? 0.7 : 1,
                    }}

                  accessibilityLabel="Interactive control"
                  accessibilityRole="button"
                  accessibilityHint="Activates this control">
                    {isAddingRival ? (
                      <Animated.View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: '#FFF',
                          borderTopColor: 'transparent',
                        }}
                      />
                    ) : (
                      <Icon name="sword" size={20} color="#FFF" />
                    )}
                    <Text
                      style={{
                        color: '#FFF',
                        fontWeight: '700',
                        fontSize: 16,
                        marginLeft: 8,
                      }}
                    >
                      {isAddingRival ? 'Adding...' : 'Add as Rival'}
                    </Text>
                  </Pressable>
                ) : (
                  <Box
                    p={16}
                    borderRadius={12}
                    alignItems="center"
                    style={{ backgroundColor: theme.colors.background.secondary }}
                  >
                    <Box flexDirection="row" alignItems="center">
                      <Icon name="check-circle" size={20} color={theme.colors.success.DEFAULT} />
                      <Text
                        variant="body"
                        style={{
                          marginLeft: 8,
                          fontWeight: '600',
                          color: theme.colors.success.DEFAULT,
                        }}
                      >
                        Already a Rival
                      </Text>
                    </Box>
                  </Box>
                )}

                <Pressable
                  onPress={onClose}
                  style={{
                    marginTop: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}

                accessibilityLabel="Close button"
                accessibilityRole="button"
                accessibilityHint="Activates this control">
                  <Text variant="body" color="text.secondary" style={{ fontWeight: '500' }}>
                    Close
                  </Text>
                </Pressable>
              </Box>
            </ScrollView>
          </Card>
        </Animated.View>
      </Box>
    </Modal>
  );
};

export default PlayerProfileCard;
