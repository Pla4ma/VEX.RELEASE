export interface LiquidGlassSphereColorConfig {
  liquidStart: string;
  liquidMid: string;
  liquidEnd: string;
  glow: string;
  rim: string;
  highlight: string;
}

export const LIQUID_GLASS_SPHERE_COLORS: Record<
  string,
  LiquidGlassSphereColorConfig
> = {
  mint: {
    liquidStart: '#5FEDC7',
    liquidMid: '#42CFAE',
    liquidEnd: '#18B894',
    glow: 'rgba(95, 237, 199, 0.35)',
    rim: '#0A9B8A',
    highlight: '#FFFFFF',
  },
  cyan: {
    liquidStart: '#84E4E5',
    liquidMid: '#5ED4D5',
    liquidEnd: '#0E9B9C',
    glow: 'rgba(132, 228, 229, 0.35)',
    rim: '#0A8A8B',
    highlight: '#FFFFFF',
  },
  teal: {
    liquidStart: '#4DD4B3',
    liquidMid: '#2CB89A',
    liquidEnd: '#0A8A72',
    glow: 'rgba(45, 184, 154, 0.35)',
    rim: '#086E5C',
    highlight: '#FFFFFF',
  },
  coral: {
    liquidStart: '#F0A88A',
    liquidMid: '#E08A6A',
    liquidEnd: '#C25E3A',
    glow: 'rgba(240, 138, 75, 0.35)',
    rim: '#A04A2A',
    highlight: '#FFFFFF',
  },
  amber: {
    liquidStart: '#F5C88A',
    liquidMid: '#E0A85A',
    liquidEnd: '#C28A2A',
    glow: 'rgba(223, 164, 74, 0.35)',
    rim: '#A0781A',
    highlight: '#FFFFFF',
  },
  pearl: {
    liquidStart: '#FFFFFF',
    liquidMid: '#F0F8F5',
    liquidEnd: '#D0E8E0',
    glow: 'rgba(255, 255, 255, 0.45)',
    rim: '#A0C8B8',
    highlight: '#FFFFFF',
  },
};
