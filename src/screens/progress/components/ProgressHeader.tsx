import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { VexIcon } from '../../../shared/ui/vex/VexIcon';
import { useTheme } from '../../../theme/ThemeContext';


interface ProgressHeaderProps {
  onOpenNotifications: () => void;
}

export function ProgressHeader({
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
          borderBottomColor: theme.colors.border.light,
          borderBottomWidth: 1,
          marginBottom: theme.spacing[5],
          paddingBottom: theme.spacing[4],
        }}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[2] }}>
          <View style={{ width: theme.spacing[2], height: theme.spacing[2], borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.primary[500] }} />
          <Text style={{ color: theme.colors.semantic.primary, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.small.fontSize, lineHeight: theme.typography.display.small.lineHeight }}>VEX</Text>
        </View>
        <Pressable
          accessibilityHint="Shows your VEX notifications"
          accessibilityLabel="Open notifications"
          accessibilityRole="button"
          onPress={onOpenNotifications}
      style={{ alignItems: 'center', borderColor: theme.colors.primary[800], borderRadius: theme.borderRadius.full, borderWidth: 1, height: theme.spacing[12], justifyContent: 'center', width: theme.spacing[12] }}
        >
          <VexIcon color={theme.colors.semantic.primary} name="bell" size="sm" variant="outline" />
        </Pressable>
      </View>
      <Text color={theme.colors.semantic.primary} variant="label" style={{ letterSpacing: 3, marginBottom: theme.spacing[2] }}>
        September 2026 · Progress
      </Text>
      <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.display.medium.fontSize, fontWeight: theme.fontWeights.heavy, lineHeight: theme.typography.display.medium.lineHeight }}>
        Your focus record.
      </Text>
      <Text color="text.secondary" variant="bodyLarge" style={{ marginTop: theme.spacing[3] }}>
        Sessions, study work, and coaching signals read as one living rhythm.
      </Text>
    </View>
  );
}
