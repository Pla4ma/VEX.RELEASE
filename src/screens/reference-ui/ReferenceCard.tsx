import React, { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { GlassCard } from '../../components/glass/GlassCard';
import { VexAssetImage } from '../../components/glass/VexAssetImage';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

interface ReferenceCardProps {
  accent?: 'mint' | 'fire';
  asset?: React.ComponentProps<typeof VexAssetImage>['name'];
  children: ReactNode;
  glow?: boolean;
  showAsset?: boolean;
  style?: ViewStyle;
}

        
export function ReferenceCard({
  accent,
  asset,
  children,
  glow = false,
  showAsset = true,
  style,
}: ReferenceCardProps): React.ReactNode {
  const assetName = asset ?? (glow ? 'progressBars' : 'coachStar');
  const railColor =
    accent === 'fire' || (accent === undefined && glow)
      ? vexLightGlass.semantic.warning
      : vexLightGlass.glass.innerHighlight;
  return (
    <GlassCard
      glowMint={glow}
      padding={glow ? 16 : 14}
      radius={glow ? 22 : 18}
      style={[{ marginBottom: glow ? 12 : 10 }, style]}
      variant={glow ? 'premium' : 'default'}
    >
      {glow || accent === 'fire' ? (
        <View
          pointerEvents="none"
          style={{}}
        />
      ) : null}
      {showAsset ? (
        <View
          pointerEvents="none"
          style={{ opacity: glow ? 0.94 : 0.62, position: 'absolute', right: 12, top: 10 }}
        >
          <VexAssetImage name={assetName} size={glow ? 48 : 38} opacity={0.96} />
        </View>
      ) : null}
      {children}
    </GlassCard>
  );
}

export default ReferenceCard;
