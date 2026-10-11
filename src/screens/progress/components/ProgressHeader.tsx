import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { VexIcon } from '../../../shared/ui/vex/VexIcon';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';


interface ProgressHeaderProps {
  onOpenGuide: () => void;
  onOpenNotifications: () => void;
}

export function ProgressHeader({
  onOpenGuide,
  onOpenNotifications,
}: ProgressHeaderProps): React.ReactNode {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing[6], width: '100%' }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderBottomColor: vexFire.line,
          borderBottomWidth: 1,
          marginBottom: theme.spacing[5],
          paddingBottom: theme.spacing[4],
        }}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[2] }}>
          <View style={{ width: theme.spacing[2], height: theme.spacing[2], borderRadius: theme.borderRadius.full, backgroundColor: vexFire.ember }} />
          <Text color={vexFire.cream} style={{ fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.small.fontSize, lineHeight: theme.typography.display.small.lineHeight }}>VEX</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
          <Pressable
            accessibilityHint="Explains how VEX works"
            accessibilityLabel="Open the VEX Field Guide"
            accessibilityRole="button"
            onPress={onOpenGuide}
            style={{ alignItems: 'center', borderColor: vexFire.borderStrong, borderRadius: theme.borderRadius.full, borderWidth: 1, height: theme.spacing[12], justifyContent: 'center', width: theme.spacing[12] }}
          >
            <VexIcon color={vexFire.ember} name="sparkles" size="sm" variant="outline" />
          </Pressable>
          <Pressable
            accessibilityHint="Shows your VEX notifications"
            accessibilityLabel="Open notifications"
            accessibilityRole="button"
            onPress={onOpenNotifications}
            style={{ alignItems: 'center', borderColor: vexFire.borderStrong, borderRadius: theme.borderRadius.full, borderWidth: 1, height: theme.spacing[12], justifyContent: 'center', width: theme.spacing[12] }}
          >
            <VexIcon color={vexFire.amber} name="bell" size="sm" variant="outline" />
          </Pressable>
        </View>
      </View>
      <Text color={vexFire.ember} variant="label" style={{ letterSpacing: 3, marginBottom: theme.spacing[2] }}>
        September 2026 · Progress
      </Text>
      <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.display.medium.fontSize, fontWeight: theme.fontWeights.heavy, lineHeight: theme.typography.display.medium.lineHeight }}>
        Your focus record.
      </Text>
      <Text color={vexFire.textSecondary} variant="bodyLarge" style={{ marginTop: theme.spacing[3] }}>
        Sessions, study work, and coaching signals read as one living rhythm.
      </Text>
    </View>
  );
}
