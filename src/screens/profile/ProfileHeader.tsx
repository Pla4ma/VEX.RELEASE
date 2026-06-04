import React from 'react';
import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Box, Text } from '../../components/primitives';
import { Icon } from '../../icons';
import { useTheme } from '../../theme';
import { lightColors } from '@/theme/tokens/colors';

import { getHeroGradientColors } from '../home/HomeScreenVisuals';
import type { User } from '../../types/models';

interface ProfileHeaderProps {
  user: User | null;
  streakDays: number;
  level: number;
  xp: number;
  nextLevelThreshold: number;
  xpPercent: number;
  onSettingsPress: () => void;
  onNotificationsPress: () => void;
  onLogout: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  streakDays,
  level,
  xp,
  nextLevelThreshold,
  xpPercent,
  onSettingsPress,
  onNotificationsPress,
  onLogout,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerColors: [string, string] = [
    ...getHeroGradientColors(streakDays),
  ] as [string, string];

  return (
    <LinearGradient
      colors={headerColors}
      style={{
        paddingTop: insets.top + theme.spacing[5],
        paddingHorizontal: theme.spacing[5],
        paddingBottom: theme.spacing[6],
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
      }}
    >
      <Box
        flexDirection="row"
        justifyContent="space-between"
        mb={theme.spacing[4]}
      >
        <Pressable
          onPress={onSettingsPress}
          style={{ padding: 8 }}
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          accessibilityHint="Opens account and app settings"
        >
          <Icon name="setting" size={24} color={theme.colors.text.inverse} />
        </Pressable>
        <Box flexDirection="row" alignItems="center" gap={8}>
          <Pressable
            onPress={onNotificationsPress}
            style={{ padding: 8 }}
            accessibilityLabel="Open notifications"
            accessibilityRole="button"
            accessibilityHint="Shows your VEX notifications"
          >
            <Icon name="notification" size={24} color={theme.colors.text.inverse} />
          </Pressable>
          <Pressable
            onPress={onLogout}
            style={{ padding: 8 }}
            accessibilityLabel="Log out"
            accessibilityRole="button"
            accessibilityHint="Signs out of this VEX account"
          >
            <Icon name="logout" size={24} color={theme.colors.text.inverse} />
          </Pressable>
        </Box>
      </Box>
      <Box alignItems="center">
        <Avatar name={user?.displayName ?? 'User'} size="xl" status="online" />
        <Text
          variant="h2"
          style={{
            color: lightColors.text.inverse,
            fontWeight: '800',
            marginTop: theme.spacing[4],
          }}
        >
          {user?.displayName ?? 'User'}
        </Text>
        <Text
          variant="body"
          style={{ color: 'rgba(255,255,255,0.78)', marginTop: 4 }}
        >
          {user?.id ?? 'No email available'}
        </Text>
        <Box flexDirection="row" mt={theme.spacing[3]}>
          <Badge variant="primary" size="sm" leftIcon="star">{`Level ${level}`}</Badge>
          <Badge variant="success" size="sm" leftIcon="fire" style={{ marginLeft: 8 }}>
            {`${streakDays} Day Streak`}
          </Badge>
        </Box>
      </Box>
      <Box mt={theme.spacing[5]}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb={8}>
          <Text
            variant="caption"
            style={{ color: 'rgba(255,255,255,0.86)' }}
          >{`Level ${level} | ${xp}/${nextLevelThreshold} XP`}</Text>
          <Text variant="caption" style={{ color: 'rgba(255,255,255,0.68)' }}>
            {`${Math.round(xpPercent)}%`}
          </Text>
        </Box>
        <Box
          height={6}
          borderRadius={999}
          overflow="hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
        >
          <Box
            height="100%"
            borderRadius={999}
            style={{ width: `${xpPercent}%`, backgroundColor: lightColors.text.inverse }}
          />
        </Box>
      </Box>
    </LinearGradient>
  );
};
