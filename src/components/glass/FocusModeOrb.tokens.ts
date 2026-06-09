export interface FocusModeConfig {
  liquidStart: string;
  liquidMid: string;
  liquidEnd: string;
  glow: string;
  rim: string;
  highlight: string;
  energyColor: string;
  symbolPath: string;
}

export const MODE_CONFIGS: Record<string, FocusModeConfig> = {
  sprint: {
    liquidStart: '#5FFFD4',
    liquidMid: '#42E8C0',
    liquidEnd: '#18D4A8',
    glow: 'rgba(95, 255, 212, 0.45)',
    rim: '#0AC495',
    highlight: '#FFFFFF',
    energyColor: '#FFD54F',
    symbolPath: 'M 24 14 L 30 24 L 26 24 L 32 34 L 22 28 L 26 28 L 20 18 Z',
  },
  light: {
    liquidStart: '#A8F8E0',
    liquidMid: '#7AEFD0',
    liquidEnd: '#4DE0B8',
    glow: 'rgba(122, 239, 208, 0.40)',
    rim: '#0A9B8A',
    highlight: '#FFFFFF',
    energyColor: '#FFFFFF',
    symbolPath: 'M 24 12 Q 18 20 18 28 Q 24 26 30 28 Q 30 20 24 12 M 22 18 L 26 18 M 22 22 L 26 22 M 22 26 L 26 26',
  },
  study: {
    liquidStart: '#84E8F5',
    liquidMid: '#5AD4E8',
    liquidEnd: '#2EB8D0',
    glow: 'rgba(90, 212, 232, 0.40)',
    rim: '#0A8AA0',
    highlight: '#FFFFFF',
    energyColor: '#FFFFFF',
    symbolPath: 'M 18 16 L 24 12 L 30 16 L 30 32 L 24 36 L 18 32 Z M 18 16 L 24 20 L 30 16 M 24 20 L 24 36',
  },
  recovery: {
    liquidStart: '#F0C8A8',
    liquidMid: '#E8A888',
    liquidEnd: '#D48868',
    glow: 'rgba(232, 168, 136, 0.40)',
    rim: '#A06848',
    highlight: '#FFFFFF',
    energyColor: '#FFD0A0',
    symbolPath: 'M 24 28 C 18 28 14 24 14 20 C 14 16 18 14 24 18 C 30 14 34 16 34 20 C 34 24 30 28 24 28 M 24 30 L 24 36 M 20 34 L 28 34',
  },
};
