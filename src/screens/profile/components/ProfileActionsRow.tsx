import React from 'react';
import { Pressable, View } from 'react-native';
import { GlassBlurLayer } from '../../../components/glass/GlassBlurLayer';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { Icon } from '../../../icons/components/Icon';
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
}): React.ReactNode {
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: vexLightGlass.glass.fillSubtle,
        borderColor: vexLightGlass.glass.innerHighlight,
        borderRadius: 999,
        borderWidth: 1.5,
        height: 44,
        justifyContent: 'center',
        boxShadow: '0px 7px 14px vexLightGlass.glass.shadowStrong / 0.85',
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
