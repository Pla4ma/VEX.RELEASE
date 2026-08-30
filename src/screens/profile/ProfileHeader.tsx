import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../components/primitives/Text';
import { VexIcon } from '../../shared/ui/vex/VexIcon';
import { useTheme } from '../../theme/ThemeContext';

interface ProfileHeaderProps {
  user: { displayName?: string | null; firstName?: string | null } | null;
  streakDays: number;
  level: number;
  xp: number;
  nextLevelThreshold: number;
  xpPercent: number;
  onSettingsPress: () => void;
  onNotificationsPress: () => void;
  onLogout: () => void;
}

function HeaderAction({ label, hint, onPress }: { label: string; hint: string; onPress: () => void }): React.JSX.Element {
  const { theme } = useTheme();
  return <Pressable accessibilityHint={hint} accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ alignItems: 'center', borderColor: theme.colors.primary[800], borderRadius: theme.borderRadius.lg, borderWidth: 1, justifyContent: 'center', minHeight: theme.spacing[10], opacity: pressed ? theme.opacity[80] : theme.opacity[100], paddingHorizontal: theme.spacing[3] })}><Text color="text.secondary" variant="caption">{label}</Text></Pressable>;
}

export function ProfileHeader({ user, streakDays, level, xp, nextLevelThreshold, xpPercent, onSettingsPress, onNotificationsPress, onLogout }: ProfileHeaderProps): React.JSX.Element {
  const { theme } = useTheme();
  const displayName = user?.displayName ?? user?.firstName ?? 'Local Dev';
  return (
    <View style={{ paddingHorizontal: theme.spacing[4], paddingTop: theme.spacing[3] }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[2] }}><View style={{ backgroundColor: theme.colors.semantic.primary, borderRadius: theme.borderRadius.full, height: theme.spacing[2], width: theme.spacing[2] }} /><Text style={{ color: theme.colors.semantic.primary, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.small.fontSize, lineHeight: theme.typography.display.small.lineHeight }}>VEX</Text></View>
        <View style={{ flexDirection: 'row', gap: theme.spacing[1] }}><HeaderAction hint="Opens account and app settings" label="Settings" onPress={onSettingsPress} /><HeaderAction hint="Shows your VEX notifications" label="Alerts" onPress={onNotificationsPress} /><HeaderAction hint="Signs out of this VEX account" label="Sign out" onPress={onLogout} /></View>
      </View>
      <View style={{ alignItems: 'center', height: theme.spacing[24] + theme.spacing[20], justifyContent: 'center', marginTop: theme.spacing[3] }}>
        <Text color={theme.colors.semantic.primary} variant="label" style={{ letterSpacing: 3 }}>VEX operative</Text>
        <Text style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.medium.fontSize, fontWeight: theme.fontWeights.regular, lineHeight: theme.typography.display.medium.lineHeight, marginTop: theme.spacing[1], textAlign: 'center' }}>{displayName}</Text>
        <Text color="text.secondary" variant="bodyLarge">Level {level} · focus player</Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[4] }}><View style={{ alignItems: 'center', borderColor: theme.colors.semantic.primary, borderRadius: theme.borderRadius.full, borderWidth: 1, flexDirection: 'row', gap: theme.spacing[1], minHeight: theme.spacing[10], paddingHorizontal: theme.spacing[4] }}><VexIcon color={theme.colors.semantic.primary} name="flame" size="xs" variant="solid" /><Text color={theme.colors.semantic.primary} variant="caption">{streakDays} day streak</Text></View><View style={{ alignItems: 'center', borderColor: theme.colors.primary[800], borderRadius: theme.borderRadius.full, borderWidth: 1, justifyContent: 'center', minHeight: theme.spacing[10], paddingHorizontal: theme.spacing[4] }}><Text style={{ color: theme.colors.semantic.primary, fontWeight: theme.fontWeights.bold }} variant="caption">2.0× rhythm</Text></View></View>
      <View style={{ gap: theme.spacing[2], marginTop: theme.spacing[5], width: '100%' }}><View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}><Text color="text.secondary" variant="label">Level {level} · {xp.toLocaleString()} / {nextLevelThreshold.toLocaleString()} XP</Text><Text color={theme.colors.semantic.primary} variant="label">{Math.round(xpPercent)}%</Text></View><View style={{ backgroundColor: theme.colors.primary[950], borderRadius: theme.borderRadius.full, height: theme.spacing[2], overflow: 'hidden' }}><View style={{ backgroundColor: theme.colors.semantic.primary, borderRadius: theme.borderRadius.full, height: '100%', width: `${Math.max(0, Math.min(100, xpPercent))}%` }} /></View></View>
      </View>
    </View>
  );
}
