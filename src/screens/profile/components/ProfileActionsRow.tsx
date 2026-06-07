import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface ProfileActionsRowProps {
  onSettingsPress: () => void;
  onNotificationsPress: () => void;
  onLogout: () => void;
}

function GlassIconButton({
  onPress,
  label,
  hint,
  iconName,
}: {
  onPress: () => void;
  label: string;
  hint: string;
  iconName: string;
}): JSX.Element {
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.38)',
        borderColor: 'rgba(255, 255, 255, 0.88)',
        borderRadius: 999,
        borderWidth: 1,
        height: 42,
        justifyContent: 'center',
        shadowColor: 'rgba(13, 76, 65, 0.14)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        overflow: 'hidden',
        width: 42,
      }}
    >
      <Icon color={vexLightGlass.text.primary} name={iconName} size="md" />
    </Pressable>
  );
}

export function ProfileActionsRow({
  onSettingsPress,
  onNotificationsPress,
  onLogout,
}: ProfileActionsRowProps): JSX.Element {
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
        iconName="setting"
        label="Open settings"
        onPress={onSettingsPress}
      />
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
        <GlassIconButton
          hint="Shows your VEX notifications"
          iconName="notification"
          label="Open notifications"
          onPress={onNotificationsPress}
        />
        <GlassIconButton
          hint="Signs out of this VEX account"
          iconName="logout"
          label="Log out"
          onPress={onLogout}
        />
      </View>
    </View>
  );
}

export default ProfileActionsRow;
