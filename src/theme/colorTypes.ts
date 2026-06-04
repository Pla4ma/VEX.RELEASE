export type ThemeMode = 'light' | 'dark' | 'system';

type BrandScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

type StateScale = {
  50: string;
  500: string;
  light: string;
  DEFAULT: string;
  dark: string;
};

type SemanticColors = {
  background: string;
  backgroundElevated: string;
  backgroundMuted: string;
  surface: string;
  surfaceElevated: string;
  surfaceGlass: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  overlay: string;
  shadow: string;
  inputBackground: string;
  inputBorder: string;
  tabActive: string;
  tabInactive: string;
  vexCyan: string;
  vexCyanSoft: string;
  vexCyanGlow: string;
  vexGold: string;
  vexGoldSoft: string;
  obsidian: string;
  editorialGold: string;
  editorialGoldBorder: string;
  editorialGoldGlow: string;
  editorialWarmText: string;
  editorialWarmMuted: string;
  editorialMuted: string;
  editorialDeepBackground: string;
  liquidNight: string;
  liquidAbyss: string;
  liquidMist: string;
  liquidGlass: string;
  liquidGlassStrong: string;
  liquidGlassClear: string;
  liquidPanel: string;
  liquidSignal: string;
  liquidGlassBorder: string;
  liquidGlassHighlight: string;
  liquidText: string;
  liquidTextSoft: string;
  liquidTextMuted: string;
  liquidCyan: string;
  liquidViolet: string;
  liquidOrange: string;
  liquidAmber: string;
  liquidRose: string;
  liquidLime: string;
  liquidShadow: string;
  liquidInput: string;
  liquidInputBorder: string;
  liquidButtonText: string;
  /** VEX brand amber — signature warm gold */
  brandAmber: string;
  /** VEX brand orange — energetic accent */
  brandOrange: string;
  /** VEX brand coral — warm editorial error */
  brandCoral: string;
  /** Dark midnight base for aurora/entry screens */
  auroraMidnight: string;
  /** Deep atmospheric violet for aurora backgrounds */
  auroraDeepViolet: string;
  /** Mid violet for aurora gradients */
  auroraMidViolet: string;
  /** Dark violet base for aurora backgrounds */
  auroraDarkBase: string;
  /** Teal accent for dust particles */
  auroraTeal: string;
  /** Warm light gold for dust/orbs */
  auroraWarmLight: string;
  /** Rescued state background (green-tinted dark) */
  stateRescued: string;
  /** Stale state background (amber-tinted dark) */
  stateStale: string;
  /** Blocked badge background (warm dark) */
  stateBlocked: string;
  /** Success green text for rescued state */
  stateRescuedText: string;
  /** Muted lavender text */
  textLavender: string;
  /** Muted violet text for handoff notes */
  textSoftViolet: string;
  /** Platinum color for "Strong" focus score */
  scorePlatinum: string;
  /** Celestial blue for "Exceptional" focus score */
  scoreCelestial: string;
  /** Muted grade D color */
  gradeMuted: string;
  /** Break gradient dark teal */
  breakGradientDark: string;
  /** Break gradient mid teal */
  breakGradientMid: string;
  /** No-streak dark background */
  noStreakDark: string;
  /** Low streak teal dark */
  lowStreakTeal: string;
  /** High streak deep teal */
  highStreakDeep: string;
  /** Bright violet shadow glow for aurora effects */
  auroraBrightViolet: string;
  /** Mid-bright violet accent for aurora glow */
  auroraAccentViolet: string;
  /** Warm editorial gold for orb/atmosphere effects */
  auroraEditorialGold: string;
  /** Deep warm dark for atmosphere base gradient */
  atmosphereBase1: string;
  /** Mid warm dark for atmosphere base gradient */
  atmosphereBase2: string;
  /** Light warm dark for atmosphere base gradient */
  atmosphereBase3: string;
  /** Deep warm brown for devotional base */
  devotionalBase: string;
  /** Cool warm brown for devotional base */
  devotionalBaseCool: string;
  /** Warm gold for devotional strokes */
  devotionalWarm: string;
  /** Soft warm gold for devotional strokes */
  devotionalWarmSoft: string;
  /** Warm ash for devotional strokes */
  devotionalAsh: string;
};

export interface ColorPalette {
  primary: BrandScale;
  success: StateScale;
  warning: StateScale;
  error: StateScale;
  info: StateScale;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    inverse: string;
    disabled: string;
    placeholder: string;
    link: string;
  };
  border: { light: string; DEFAULT: string; strong: string; focus: string };
  surface: {
    card: string;
    input: string;
    button: string;
    hover: string;
    pressed: string;
    selected: string;
  };
  accent: {
    purple: string;
    blue: string;
    green: string;
    orange: string;
    pink: string;
    teal: string;
  };
  semantic: SemanticColors;
}
