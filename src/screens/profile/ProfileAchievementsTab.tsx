import React from 'react';
import { Pressable, View } from 'react-native';
import { Box, Text } from '../../components/primitives/Box';
import { GlassCard } from '../../components/glass/GlassCard';
import { GlassIconOrb } from '../../components/glass/GlassIconOrb';
import { GlassPill } from '../../components/glass/GlassPill';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { FloatingDroplets } from '../../components/glass/FloatingDroplets';
import { EmptyStateLens } from '../../components/glass/EmptyStateLens';
import { Icon } from '../../icons/components/Icon';
import type { Theme } from '../../theme/types';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

interface AchievementCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  progressLabel: string;
  statusLabel: string;
  statusTone: 'success' | 'secondary';
  accessibilityLabel: string;
}

interface ProfileAchievementsTabProps {
  theme: Theme;
  isLoading: boolean;
  isError: boolean;
  achievements: AchievementCard[];
  onOpenAchievements: () => void;
  onStartSession: () => void;
}

export const ProfileAchievementsTab: React.FC<ProfileAchievementsTabProps> = ({
  theme,
  isLoading,
  isError,
  achievements,
  onOpenAchievements,
  onStartSession,
}) => {
  void theme;
  if (isLoading) {
    return (
      <GlassCard size="lg" variant="default" padding={18} radius={26}>
        <Skeleton lines={6} height={22} borderRadius={10} spacing={12} />
      </GlassCard>
    );
  }

  if (isError) {
    return (
      <GlassCard size="lg" variant="default" padding={18} radius={26}>
        <EmptyState
          iconName="exclamation-circle"
          title="Achievements unavailable"
          body="Your identity rewards could not load right now. Retry from the achievements screen or come back after your next session."
          actionLabel="Open achievements"
          onAction={onOpenAchievements}
        />
      </GlassCard>
    );
  }

  if (achievements.length === 0) {
    return (
      <GlassCard size="lg" variant="default" padding={18} radius={26}>
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            right: 12,
            top: 12,
            zIndex: 0,
          }}
        >
          <FloatingDroplets count={4} opacity={0.65} size={36} />
        </View>
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            left: 12,
            bottom: 12,
            zIndex: 0,
          }}
        >
          <EmptyStateLens size={56} opacity={0.65} dotCount={3} />
        </View>
        <EmptyState
          iconName="plus-circle"
          title="No earned proof yet"
          body="Complete your first focus session to unlock real achievements on this profile."
          actionLabel="Start session"
          onAction={onStartSession}
        />
      </GlassCard>
    );
  }

  return (
    <Box gap={12}>
      {achievements.map((item) => (
        <Pressable
          key={item.id}
          onPress={onOpenAchievements}
          accessibilityLabel={item.accessibilityLabel}
          accessibilityRole="button"
          accessibilityHint="Opens the full achievement collection"
        >
          <View
            style={{
              opacity: item.statusTone === 'success' ? 1 : 0.78,
            }}
          >
            <GlassCard
              size="md"
              variant={item.statusTone === 'success' ? 'success' : 'subtle'}
              padding={14}
              radius={20}
            >
              <Box flexDirection="row" alignItems="center" gap={12}>
                <GlassIconOrb
                  size={44}
                  variant={item.statusTone === 'success' ? 'mint' : 'pearl'}
                >
                  <Icon
                    name={item.statusTone === 'success' ? 'check-circle' : 'award'}
                    size="md"
                    color={item.statusTone === 'success' ? vexLightGlass.mint[700] : vexLightGlass.text.secondary}
                    variant="solid"
                  />
                </GlassIconOrb>
                <Box flex={1}>
                  <Text
                    style={{
                      color: vexLightGlass.text.primary,
                      fontSize: 15,
                      fontWeight: '800',
                      letterSpacing: -0.2,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      color: vexLightGlass.text.secondary,
                      fontSize: 12,
                      lineHeight: 17,
                    }}
                  >
                    {item.description}
                  </Text>
                  <Text
                    style={{
                      color: vexLightGlass.text.tertiary,
                      fontSize: 12,
                      fontWeight: '600',
                      marginTop: 4,
                    }}
                  >
                    {item.progressLabel}
                  </Text>
                </Box>
                <GlassPill
                  label={item.statusLabel}
                  variant={item.statusTone === 'success' ? 'success' : 'neutral'}
                  size="sm"
                />
              </Box>
            </GlassCard>
          </View>
        </Pressable>
      ))}
    </Box>
  );
};
