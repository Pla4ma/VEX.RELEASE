/**
 * VEX Light Glass Tokens — June 2026 visual language
 *
 * Pure data: mint atmosphere, pearl glass, frosted surfaces, soft depth.
 * The design system that replaces dark/obsidian with light glass.
 */

export const vexLightGlass = {
  background: {
    pageTop: '#F8FFFC',
    pageMid: '#EEF8F4',
    pageBottom: '#DDECE8',
    atmosphericMint: 'rgba(95, 230, 197, 0.32)',
    mintTrack: 'rgba(12, 118, 95, 0.14)',
    atmosphericCyan: 'rgba(132, 228, 229, 0.28)',
    atmosphericPearl: 'rgba(255, 255, 255, 0.56)',
    atmosphericShadow: 'rgba(13, 76, 65, 0.10)',
    atmosphericFire: 'rgba(255, 128, 32, 0.28)',
    transparent: 'rgba(255, 255, 255, 0)',
  },

  text: {
    primary: '#10231F',
    secondary: 'rgba(16, 35, 31, 0.82)',
    tertiary: 'rgba(16, 35, 31, 0.64)',
    disabled: 'rgba(16, 35, 31, 0.32)',
    inverse: '#FFFFFF',
    onMint: '#0A5E4D',
  },

  mint: {
    50: '#EFFFFA',
    100: '#D8FBF1',
    200: '#A9F0DD',
    300: '#72E0C5',
    400: '#42CFAE',
    500: '#18B894',
    600: '#109779',
    700: '#0C765F',
    800: '#0A5E4D',
    900: '#064338',
  },

  glass: {
    fillSubtle: 'rgba(255, 255, 255, 0.52)',
    fill: 'rgba(255, 255, 255, 0.7)',
    fillStrong: 'rgba(255, 255, 255, 0.84)',
    fillHero: 'rgba(255, 255, 255, 0.78)',
    card: 'rgba(255, 255, 255, 0.64)',
    border: 'rgba(255, 255, 255, 0.88)',
    borderSubtle: 'rgba(255, 255, 255, 0.5)',
    innerHighlight: 'rgba(255, 255, 255, 0.92)',
    innerShadow: 'rgba(15, 72, 61, 0.08)',
    shadow: 'rgba(13, 76, 65, 0.13)',
    shadowStrong: 'rgba(13, 76, 65, 0.22)',
  },

  semantic: {
    success: '#18B894',
    warning: '#DFA44A',
    danger: '#E05E5E',
    info: '#54AEEA',
    accent: '#8B5CF6',
    purple: '#8B5CF6',
    stable: '#18B894',
    premium: '#79DFC9',
    fire: '#FF8427',
    fireDeep: '#B94F13',
    amber: '#F2B15E',
  },
} as const;

export const glassMaterials = {
  pane: {
    backgroundColor: vexLightGlass.glass.fill,
    borderColor: vexLightGlass.glass.border,
    borderWidth: 1,
    shadowColor: vexLightGlass.glass.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  paneStrong: {
    backgroundColor: vexLightGlass.glass.fillStrong,
    borderColor: vexLightGlass.glass.border,
    borderWidth: 1,
    shadowColor: vexLightGlass.glass.shadowStrong,
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  hero: {
    backgroundColor: vexLightGlass.glass.fillHero,
    borderColor: vexLightGlass.glass.border,
    borderWidth: 1,
    shadowColor: vexLightGlass.mint[700],
    shadowOpacity: 0.18,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 20 },
    elevation: 10,
  },
  nav: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    shadowColor: 'rgba(13, 76, 65, 0.22)',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  tabPill: {
    backgroundColor: 'rgba(66, 207, 174, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.86)',
    borderWidth: 1,
    borderRadius: 999,
  },
} as const;

export const glassMotion = {
  screenEnter: { duration: 420, easing: 'easeOutCubic' },
  cardEnter: { duration: 360, stagger: 45 },
  pressDownScale: 0.985,
  pressUpSpring: { damping: 18, stiffness: 180 },
  selectedPillSpring: { damping: 20, stiffness: 220 },
  progressSpring: { damping: 18, stiffness: 130 },
} as const;

export const glassRadius = {
  screenHero: 32,
  cardLg: 28,
  card: 24,
  cardSm: 20,
  pill: 999,
  tabBar: 30,
  orb: 22,
  sheetTop: 32,
} as const;

export type VexLightGlass = typeof vexLightGlass;
export type GlassMaterials = typeof glassMaterials;
export type GlassMotion = typeof glassMotion;
export type GlassRadius = typeof glassRadius;
