import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassIconOrb } from '../../../components/glass/GlassIconOrb';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export interface ProfileStatItem {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface ProfileStatTileProps {
  item: ProfileStatItem;
  loading: boolean;
}

export function ProfileStatTile({ item, loading }: ProfileStatTileProps): JSX.Element {
  return (
    <View style={{ width: '47%' }}>
      <GlassCard padding={12} radius={16} size="md" variant="default">
        <GlassIconOrb size={30} variant="mint">
          <Icon color={item.color} name={item.icon} size="sm" variant="solid" />
        </GlassIconOrb>
        <Text
          style={{
            color: vexLightGlass.text.tertiary,
            fontSize: 11,
            fontWeight: '600',
            marginTop: 8,
          }}
        >
          {item.label}
        </Text>
        {loading ? (
          <Skeleton borderRadius={10} height={28} width="70%" />
        ) : (
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 18,
              fontWeight: '800',
              letterSpacing: -0.3,
              marginTop: 4,
            }}
          >
            {item.value}
          </Text>
        )}
      </GlassCard>
    </View>
  );
}

export default ProfileStatTile;
