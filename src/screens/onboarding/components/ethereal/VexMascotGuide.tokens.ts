import type { ImageSourcePropType } from 'react-native';

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

export type MascotSizeConfig = {
  width: number;
  height: number;
  bubblePadding: number;
  bubbleRadius: number;
};

// All moods map to the single available asset; replace paths when more assets are added.
export const MOOD_ASSET_MAP: Record<MascotMood, ImageSourcePropType> = {
  default: require('../../../../../assets/mascot/vex-mascot.png'),
  wave: require('../../../../../assets/mascot/vex-mascot.png'),
  pointing: require('../../../../../assets/mascot/vex-mascot.png'),
  thinking: require('../../../../../assets/mascot/vex-mascot.png'),
  encouraging: require('../../../../../assets/mascot/vex-mascot.png'),
  celebrate: require('../../../../../assets/mascot/vex-mascot.png'),
  recovery: require('../../../../../assets/mascot/vex-mascot.png'),
};

export const FALLBACK_MASCOT = require('../../../../../assets/mascot/vex-mascot.png');

export const SIZE_CONFIG: Record<MascotSize, MascotSizeConfig> = {
  loginCompact: { width: 82, height: 104, bubblePadding: 14, bubbleRadius: 22 },
  loginFeatured: { width: 118, height: 152, bubblePadding: 16, bubbleRadius: 24 },
  authForm: { width: 80, height: 102, bubblePadding: 14, bubbleRadius: 22 },
  question: { width: 96, height: 122, bubblePadding: 14, bubbleRadius: 24 },
  confirm: { width: 104, height: 136, bubblePadding: 16, bubbleRadius: 26 },
  complete: { width: 150, height: 196, bubblePadding: 18, bubbleRadius: 28 },
  inline: { width: 72, height: 96, bubblePadding: 12, bubbleRadius: 22 },
};

export const PLACEMENT_STYLES: Record<MascotPlacement, object> = {
  inline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  header: { flexDirection: 'column', alignItems: 'center', gap: 10 },
  corner: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
};
