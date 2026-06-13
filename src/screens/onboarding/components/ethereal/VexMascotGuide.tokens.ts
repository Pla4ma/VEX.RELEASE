import type { ImageSourcePropType } from 'react-native';

export type MascotMood =
  | 'default'
  | 'wave'
  | 'listening'
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

export const MOOD_ASSET_MAP: Record<MascotMood, ImageSourcePropType> = {
  default: require('../../../../../assets/mascot/mascot_default.png'),
  wave: require('../../../../../assets/mascot/mascot_wave.png'),
  listening: require('../../../../../assets/mascot/mascot_default.png'),
  pointing: require('../../../../../assets/mascot/mascot_pointing.png'),
  thinking: require('../../../../../assets/mascot/mascot_thinking.png'),
  encouraging: require('../../../../../assets/mascot/mascot_encouraging.png'),
  celebrate: require('../../../../../assets/mascot/mascot_celebrate.png'),
  recovery: require('../../../../../assets/mascot/mascot_recovery.png'),
};

export const FALLBACK_MASCOT = require('../../../../../assets/mascot/mascot_default.png');

export const SIZE_CONFIG: Record<MascotSize, MascotSizeConfig> = {
  loginCompact: { width: 92, height: 112, bubblePadding: 12, bubbleRadius: 22 },
  loginFeatured: { width: 118, height: 152, bubblePadding: 16, bubbleRadius: 24 },
  authForm: { width: 88, height: 106, bubblePadding: 12, bubbleRadius: 22 },
  question: { width: 106, height: 112, bubblePadding: 12, bubbleRadius: 24 },
  confirm: { width: 112, height: 118, bubblePadding: 12, bubbleRadius: 24 },
  complete: { width: 150, height: 196, bubblePadding: 18, bubbleRadius: 28 },
  inline: { width: 72, height: 96, bubblePadding: 12, bubbleRadius: 22 },
};

export const MASCOT_MOOD_NUMBER: Record<MascotMood, number> = {
  default: 0,
  wave: 1,
  listening: 2,
  pointing: 3,
  thinking: 4,
  encouraging: 5,
  celebrate: 6,
  recovery: 7,
};

export const PLACEMENT_STYLES: Record<MascotPlacement, object> = {
  inline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  header: { flexDirection: 'column', alignItems: 'center', gap: 10 },
  corner: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
};
