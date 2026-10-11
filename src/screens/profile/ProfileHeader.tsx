import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { Text } from '../../components/primitives/Text';
import { VexIcon } from '../../shared/ui/vex/VexIcon';
import { useTheme } from '../../theme/ThemeContext';
import { vexFire } from '../../theme/tokens/vex-fire';

const IDENTITY_MEDALLION = require('../../../assets/vex/profile/identity-medallion.png');

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
  return <Pressable accessibilityHint={hint} accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ alignItems: 'center', borderColor: vexFire.border, borderRadius: theme.borderRadius.lg, borderWidth: 1, justifyContent: 'center', minHeight: theme.spacing[10], opacity: pressed ? theme.opacity[80] : theme.opacity[100], paddingHorizontal: theme.spacing[3] })}><Text color={vexFire.textSecondary} variant="caption">{label}</Text></Pressable>;
}

export function ProfileHeader({ user, streakDays, level, xp, nextLevelThreshold, xpPercent, onSettingsPress, onNotificationsPress, onLogout }: ProfileHeaderProps): React.JSX.Element {
  const { theme } = useTheme();
  const displayName = user?.displayName ?? user?.firstName ?? 'Local Dev';
  return (
    <View style={{ paddingHorizontal: theme.spacing[4], paddingTop: theme.spacing[3] }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[2] }}><View style={{ backgroundColor: vexFire.ember, borderRadius: theme.borderRadius.full, height: theme.spacing[2], width: theme.spacing[2] }} /><Text color={vexFire.cream} style={{ fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.small.fontSize, lineHeight: theme.typography.display.small.lineHeight }}>VEX</Text></View>
        <View style={{ flexDirection: 'row', gap: theme.spacing[1] }}><HeaderAction hint="Opens account and app settings" label="Settings" onPress={onSettingsPress} /><HeaderAction hint="Shows your VEX notifications" label="Alerts" onPress={onNotificationsPress} /><HeaderAction hint="Signs out of this VEX account" label="Sign out" onPress={onLogout} /></View>
      </View>
      <View style={{ alignItems: 'center', height: theme.spacing[24] + theme.spacing[20] + theme.spacing[16] + theme.spacing[8], justifyContent: 'center', marginTop: theme.spacing[10] }}>
        <Image accessibilityLabel="VEX identity medallion" accessibilityIgnoresInvertColors resizeMode="contain" source={IDENTITY_MEDALLION} style={{ height: theme.spacing[24], marginBottom: theme.spacing[2], width: theme.spacing[24] }} />
        <Text color={vexFire.ember} variant="label" style={{ letterSpacing: 3 }}>VEX operative</Text>
        <Text style={{ color: vexFire.cream, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.medium.fontSize, fontWeight: theme.fontWeights.regular, lineHeight: theme.typography.display.medium.lineHeight, marginTop: theme.spacing[1], textAlign: 'center' }}>{displayName}</Text>
        <Text color={vexFire.textSecondary} variant="bodyLarge">Level {level} · focus player</Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[4] }}><View style={{ alignItems: 'center', borderColor: vexFire.ember, borderRadius: theme.borderRadius.full, borderWidth: 1, flexDirection: 'row', gap: theme.spacing[1], minHeight: theme.spacing[10], paddingHorizontal: theme.spacing[4] }}><VexIcon color={vexFire.ember} name="flame" size="xs" variant="solid" /><Text color={vexFire.ember} variant="caption">{streakDays} day streak</Text></View><View style={{ alignItems: 'center', borderColor: vexFire.border, borderRadius: theme.borderRadius.full, borderWidth: 1, justifyContent: 'center', minHeight: theme.spacing[10], paddingHorizontal: theme.spacing[4] }}><Text color={vexFire.amber} variant="caption">2.0× rhythm</Text></View></View>
      <View style={{ gap: theme.spacing[2], marginTop: theme.spacing[5], width: '100%' }}><View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}><Text color={vexFire.textSecondary} variant="label">Level {level} · {xp.toLocaleString()} / {nextLevelThreshold.toLocaleString()} XP</Text><Text color={vexFire.amber} variant="label">{Math.round(xpPercent)}%</Text></View><View style={{ backgroundColor: vexFire.backgroundRaised, borderRadius: theme.borderRadius.full, height: theme.spacing[2], overflow: 'hidden' }}><View style={{ backgroundColor: vexFire.ember, borderRadius: theme.borderRadius.full, height: '100%', width: `${Math.max(0, Math.min(100, xpPercent))}%` }} /></View></View>
      </View>
    </View>
  );
}
