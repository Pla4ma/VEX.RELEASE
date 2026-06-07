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
      <GlassCard padding={14} radius={20} size="md" variant="default">
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <GlassIconOrb size={36} variant="mint">
            <Icon color={item.color} name={item.icon} size="sm" variant="solid" />
          </GlassIconOrb>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </Text>
            {loading ? (
              <Skeleton borderRadius={8} height={20} width="70%" />
            ) : (
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 18,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                  marginTop: 2,
                }}
              >
                {item.value}
              </Text>
            )}
          </View>
        </View>
      </GlassCard>
    </View>
  );
}

export default ProfileStatTile;
