import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';


interface ProfileActionsRowProps {
  onSettingsPress: () => void;
  onNotificationsPress: () => void;
  onLogout: () => void;
}

    
function GlassIconButton({
  onPress,
  label,
  hint,
}: {
  onPress: () => void;
  label: string;
  hint: string;
}): React.ReactNode {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: vexFire.panel,
        borderColor: vexFire.border,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 44,
        opacity: pressed ? 0.78 : 1,
        paddingHorizontal: theme.spacing[3],
      })}
    >
      <Text color={vexFire.textSecondary} variant="caption">{label}</Text>
    </Pressable>
  );
}

export function ProfileActionsRow({
  onSettingsPress,
  onNotificationsPress,
  onLogout,
}: ProfileActionsRowProps): React.ReactNode {
  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}
    >
      <GlassIconButton
        hint="Opens account and app settings"
        label="Settings"
        onPress={onSettingsPress}
      />
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
        <GlassIconButton
          hint="Shows your VEX notifications"
          label="Alerts"
          onPress={onNotificationsPress}
        />
        <GlassIconButton
          hint="Signs out of this VEX account"
          label="Sign out"
          onPress={onLogout}
        />
      </View>
    </View>
  );
}
