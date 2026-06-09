import React from 'react';
import { Pressable, View } from 'react-native';
import { GlassBlurLayer } from '../../../components/glass/GlassBlurLayer';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
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
        backgroundColor: 'rgba(255, 255, 255, 0.48)',
        borderColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 999,
        borderWidth: 1.5,
        height: 44,
        justifyContent: 'center',
        shadowColor: 'rgba(13, 76, 65, 0.18)',
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.85,
        shadowRadius: 14,
        overflow: 'hidden',
        width: 44,
      }}
    >
      <GlassBlurLayer intensity={72} radius={999} />
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
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 20,
          top: -8,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={3} opacity={0.65} size={32} />
      </View>
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
