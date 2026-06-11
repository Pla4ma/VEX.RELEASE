import React, { useMemo } from 'react';
import { Image, View, type ImageSourcePropType } from 'react-native';
import Animated from 'react-native-reanimated';

import { Text } from '../../../../components/primitives/Text';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { etherealText } from '@/theme/tokens/ethereal-sky';
import { useMascotFloatAnimation, useMascotGuideAnimatedStyle, GuideAction } from './VexMascotGuide.helpers';

export type MascotMood =
  | 'default'
  | 'wave'
  | 'pointing'
  | 'thinking'
  | 'encouraging'
  | 'celebrate'
  | 'recovery';

export type MascotSize = 'loginCompact' | 'loginFeatured' | 'authForm' | 'question' | 'confirm' | 'complete' | 'inline';
export type MascotPlacement = 'inline' | 'header' | 'corner';

const MOOD_ASSET_MAP: Record<MascotMood, ImageSourcePropType> = {
  default: require('../../../../../assets/mascot/vex-mascot.png'),
  wave: require('../../../../../assets/mascot/vex-mascot.png'),
  pointing: require('../../../../../assets/mascot/vex-mascot.png'),
  thinking: require('../../../../../assets/mascot/vex-mascot.png'),
  encouraging: require('../../../../../assets/mascot/vex-mascot.png'),
  celebrate: require('../../../../../assets/mascot/vex-mascot.png'),
  recovery: require('../../../../../assets/mascot/vex-mascot.png'),
};

const FALLBACK_MASCOT = require('../../../../../assets/mascot/vex-mascot.png');

const SIZE_CONFIG: Record<
  MascotSize,
  { width: number; height: number; bubblePadding: number; bubbleRadius: number }
> = {
  loginCompact: { width: 82, height: 104, bubblePadding: 14, bubbleRadius: 22 },
  loginFeatured: { width: 118, height: 152, bubblePadding: 16, bubbleRadius: 24 },
  authForm: { width: 80, height: 102, bubblePadding: 14, bubbleRadius: 22 },
  question: { width: 96, height: 122, bubblePadding: 14, bubbleRadius: 24 },
  confirm: { width: 104, height: 136, bubblePadding: 16, bubbleRadius: 26 },
  complete: { width: 150, height: 196, bubblePadding: 18, bubbleRadius: 28 },
  inline: { width: 72, height: 96, bubblePadding: 12, bubbleRadius: 22 },
};

const PLACEMENT_STYLES: Record<MascotPlacement, object> = {
  inline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  header: { flexDirection: 'column', alignItems: 'center', gap: 10 },
  corner: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
};

function resolveMoodAsset(mood: MascotMood): ImageSourcePropType {
  try {
    return MOOD_ASSET_MAP[mood] ?? FALLBACK_MASCOT;
  } catch {
    return FALLBACK_MASCOT;
  }
}

type VexMascotGuideProps = {
  mood?: MascotMood;
  message: string;
  submessage?: string;
  size?: MascotSize;
  placement?: MascotPlacement;
  onBack?: () => void;
  onReplay?: () => void;
  onSkip?: () => void;
  hideActions?: boolean;
  style?: object;
};

export function VexMascotGuide({
  mood = 'default',
  message,
  submessage,
  size = 'question',
  placement = 'inline',
  onBack,
  onReplay,
  onSkip,
  hideActions = false,
  style,
}: VexMascotGuideProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const { float, scale } = useMascotFloatAnimation(mood, isReducedMotion);
  const mascotStyle = useMascotGuideAnimatedStyle(float, scale, isReducedMotion);
  const config = SIZE_CONFIG[size];

  const asset = useMemo(() => resolveMoodAsset(mood), [mood]);
  const placementStyle = PLACEMENT_STYLES[placement];
  const bubbleFlex = placement === 'header' ? 0 : 1;

  return (
    <View style={[{ width: '100%' }, placementStyle, style]}>
      <Animated.View style={mascotStyle}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel={`VEX mascot ${mood}`}
          source={asset}
          style={{
            width: config.width,
            height: config.height,
            resizeMode: 'contain',
          }}
        />
      </Animated.View>

      <View
        style={{
          flex: bubbleFlex,
          backgroundColor: 'rgba(255,255,255,0.86)',
          borderColor: 'rgba(255,255,255,0.75)',
          borderRadius: config.bubbleRadius,
          borderWidth: 1,
          gap: 4,
          padding: config.bubblePadding,
          shadowColor: 'rgba(13,76,65,0.12)',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
        }}
      >
        <Text
          fontSize={placement === 'corner' ? 14 : 17}
          fontWeight="800"
          style={{ color: etherealText.heading, lineHeight: 22 }}
        >
          {message}
        </Text>

        {submessage ? (
          <Text
            fontSize={13}
            fontWeight="600"
            style={{ color: etherealText.subtitle, lineHeight: 18 }}
          >
            {submessage}
          </Text>
        ) : null}

        {!hideActions && (onBack || onReplay || onSkip) ? (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            {onBack ? <GuideAction label="Back" onPress={onBack} /> : null}
            {onReplay ? <GuideAction label="Replay" onPress={onReplay} /> : null}
            {onSkip ? <GuideAction label="Skip guide" onPress={onSkip} strong /> : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
