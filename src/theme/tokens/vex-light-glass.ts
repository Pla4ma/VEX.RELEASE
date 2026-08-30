/**
 * VEX Light Glass Tokens — June 2026 visual language
 *
 * Pure data: mint atmosphere, pearl glass, frosted surfaces, soft depth.
 * The design system that replaces dark/obsidian with light glass.
 */

export const vexLightGlass = {
  background: {
    pageTop: '#FFF9F5',
    pageMid: '#F8F0FA',
    pageBottom: '#F0EAFB',
    atmosphericMint: '#F0EAFB',
    mintTrack: '#E9DEFF',
    atmosphericCyan: '#F0EAFB',
    atmosphericPearl: '#FFFFFF',
    atmosphericShadow: '#EADFD7',
    atmosphericFire: '#FFE4D7',
    transparent: '#FFF9F5',
  },

  text: {
    primary: '#241A2E',
    secondary: '#51465D',
    tertiary: '#756A80',
    disabled: '#A79CAB',
    inverse: '#FFF9F5',
    onMint: '#6043B5',
  },

  mint: {
    50: '#FFF7F0',
    100: '#FFE4D7',
    200: '#FFD0BB',
    300: '#FFB99C',
    400: '#FF8A5B',
    500: '#F06435',
    600: '#D6532B',
    700: '#7654D6',
    800: '#6043B5',
    900: '#3B2B4B',
  },

  glass: {
    fillSubtle: '#FFF9F5',
    fill: '#FFFFFF',
    fillStrong: '#FFFFFF',
    fillHero: '#FFF3EA',
    card: '#FFFFFF',
    border: '#E8DDF0',
    borderSubtle: '#F0EAFB',
    innerHighlight: '#FFFFFF',
    innerShadow: '#EADFD7',
    shadow: '#D9C9DE',
    shadowStrong: '#C8B2D4',
  },

  semantic: {
    success: '#2E8B70',
    warning: '#B86B1E',
    danger: '#C44343',
    info: '#4E67B8',
    accent: '#7654D6',
    purple: '#7654D6',
    stable: '#2E8B70',
    premium: '#7654D6',
    fire: '#F06435',
    fireDeep: '#B84324',
    amber: '#FFB45C',
  },
} as const;

export const glassMaterials = {
  pane: {
    backgroundColor: vexLightGlass.glass.fill,
    borderColor: vexLightGlass.glass.border,
    borderWidth: 1,
    shadowColor: vexLightGlass.glass.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  paneStrong: {
    backgroundColor: vexLightGlass.glass.fillStrong,
    borderColor: vexLightGlass.glass.border,
    borderWidth: 1,
    shadowColor: vexLightGlass.glass.shadowStrong,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  hero: {
    backgroundColor: vexLightGlass.glass.fillHero,
    borderColor: vexLightGlass.semantic.fire,
    borderWidth: 1,
    shadowColor: vexLightGlass.glass.shadowStrong,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  nav: {
    backgroundColor: vexLightGlass.glass.fillStrong,
    borderColor: vexLightGlass.glass.border,
    borderWidth: 1,
    shadowColor: vexLightGlass.glass.shadowStrong,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  tabPill: {
    backgroundColor: vexLightGlass.semantic.accent,
    borderColor: vexLightGlass.glass.border,
    borderWidth: 1,
    borderRadius: 999,
  },
} as const;

export const glassMotion = {
  screenEnter: { duration: 260, easing: 'easeOutCubic' },
  cardEnter: { duration: 220, stagger: 35 },
  pressDownScale: 0.98,
  pressUpSpring: { damping: 18, stiffness: 220 },
  selectedPillSpring: { damping: 20, stiffness: 240 },
  progressSpring: { damping: 18, stiffness: 160 },
} as const;

export const glassRadius = {
  screenHero: 28,
  cardLg: 22,
  card: 20,
  cardSm: 16,
  pill: 999,
  tabBar: 22,
  orb: 18,
  sheetTop: 28,
} as const;

export type VexLightGlass = typeof vexLightGlass;
export type GlassMaterials = typeof glassMaterials;
export type GlassMotion = typeof glassMotion;
export type GlassRadius = typeof glassRadius;
