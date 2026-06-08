import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassIconOrb } from '../../../components/glass/GlassIconOrb';
import { GlassPill } from '../../../components/glass/GlassPill';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export interface ProfileStatItem {
  icon: string;
  iconOrb: 'mint' | 'cyan' | 'fire' | 'amber' | 'lavender' | 'pearl';
  label: string;
  value: string;
  change?: string;
}

export interface ProfileStatTileProps {
  item: ProfileStatItem;
  loading?: boolean;
}

export const ProfileStatTile: React.FC<ProfileStatTileProps> = ({
  item,
  loading,
}) => {
  if (loading) {
    return (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.40)',
          borderColor: 'rgba(255, 255, 255, 0.90)',
          borderRadius: 22,
          borderWidth: 1.5,
          paddingHorizontal: 14,
          paddingVertical: 16,
          shadowColor: 'rgba(13, 76, 65, 0.12)',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          gap: 8,
          minWidth: 100,
          minHeight: 100,
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={vexLightGlass.mint[500]} />
      </View>
    );
  }

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.40)',
        borderColor: 'rgba(255, 255, 255, 0.90)',
        borderRadius: 22,
        borderWidth: 1.5,
        paddingHorizontal: 14,
        paddingVertical: 16,
        shadowColor: 'rgba(13, 76, 65, 0.12)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        gap: 8,
      }}
    >
      <GlassIconOrb size={44} variant={item.iconOrb}>
        <Icon color="#0C765F" name={item.icon} size="sm" variant="solid" />
      </GlassIconOrb>
      <View style={{ alignItems: 'center', gap: 3 }}>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 18,
            fontWeight: '900',
            letterSpacing: -0.3,
          }}
        >
          {item.value}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 12,
            fontWeight: '500',
          }}
        >
          {item.label}
        </Text>
      </View>
      {item.change ? (
        <GlassPill
          label={item.change}
          size="sm"
          variant={item.change.startsWith('+') ? 'mint' : 'fire'}
        />
      ) : null}
    </View>
  );
};

export default ProfileStatTile;
