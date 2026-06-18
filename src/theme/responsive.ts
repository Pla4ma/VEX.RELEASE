import { Dimensions, PixelRatio, Platform } from 'react-native';
import { lightColors } from '@/theme/tokens/colors';

const getWindow = () => Dimensions.get('window');

/** Reactive device properties — reads current window dimensions on each access. */
export const Device = {
  get width() { return getWindow().width; },
  get height() { return getWindow().height; },
  get isSmall() { return getWindow().height < 700; },
  get isMedium() { return getWindow().height >= 700 && getWindow().height < 850; },
  get isLarge() { return getWindow().height >= 850; },
  get isTablet() { return getWindow().width > 768; },
  get isLandscape() { return getWindow().width > getWindow().height; },
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

export const breakpoints = { xs: 0, sm: 320, md: 375, lg: 414, xl: 768 };
export function responsive<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}): T {
  const { xs, sm, md, lg, xl, default: defaultValue } = values;
  if (Device.width >= breakpoints.xl && xl !== undefined) {
    return xl;
  }
  if (Device.width >= breakpoints.lg && lg !== undefined) {
    return lg;
  }
  if (Device.width >= breakpoints.md && md !== undefined) {
    return md;
  }
  if (Device.width >= breakpoints.sm && sm !== undefined) {
    return sm;
  }
  if (xs !== undefined) {
    return xs;
  }
  return defaultValue;
}
export const spacing = {
  xs: responsive({ xs: 4, sm: 4, md: 4, default: 4 }),
  sm: responsive({ xs: 6, sm: 8, md: 8, default: 8 }),
  md: responsive({ xs: 10, sm: 12, md: 16, default: 16 }),
  lg: responsive({ xs: 14, sm: 16, md: 24, default: 24 }),
  xl: responsive({ xs: 20, sm: 24, md: 32, default: 32 }),
  '2xl': responsive({ xs: 28, sm: 32, md: 48, default: 48 }),
  screenEdge: responsive({ xs: 12, sm: 16, md: 20, default: 24 }),
  section: responsive({ xs: 20, sm: 24, md: 32, default: 40 }),
  card: responsive({ xs: 12, sm: 16, md: 20, default: 24 }),
  touch: 44,
  touchComfortable: 48,
};
export const typography = {
  h1: {
    fontSize: responsive({ xs: 28, sm: 30, md: 32, default: 36 }),
    lineHeight: responsive({ xs: 32, sm: 36, md: 40, default: 44 }),
    fontWeight: '800' as const,
  },
  h2: {
    fontSize: responsive({ xs: 22, sm: 24, md: 26, default: 28 }),
    lineHeight: responsive({ xs: 26, sm: 28, md: 30, default: 32 }),
    fontWeight: '800' as const,
  },
  h3: {
    fontSize: responsive({ xs: 18, sm: 20, md: 22, default: 24 }),
    lineHeight: responsive({ xs: 22, sm: 24, md: 26, default: 28 }),
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: responsive({ xs: 15, sm: 16, md: 18, default: 20 }),
    lineHeight: responsive({ xs: 19, sm: 20, md: 22, default: 24 }),
    fontWeight: '600' as const,
  },
  body: {
    fontSize: responsive({ xs: 14, sm: 14, md: 16, default: 16 }),
    lineHeight: responsive({ xs: 20, sm: 20, md: 24, default: 24 }),
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: responsive({ xs: 11, sm: 12, md: 13, default: 14 }),
    lineHeight: responsive({ xs: 14, sm: 16, md: 18, default: 18 }),
    fontWeight: '400' as const,
  },
};
export const layout = {
  maxContentWidth: 480,
  get gridColumns() { return responsive({ xs: 1, sm: 2, md: 2, lg: 3, default: 2 }); },
  get cardWidth() {
    return responsive({
      xs: Device.width - 24,
      sm: (Device.width - 40) / 2,
      md: (Device.width - 48) / 2,
      default: 160,
    });
  },
  bottomSheet: {
    get peek() { return responsive({ xs: 80, sm: 90, md: 100, default: 120 }); },
    get half() { return Math.round(Device.height * 0.5); },
    get full() { return Device.height - 100; },
  },
};
export const accessibility = {
  minTouchTarget: 44,
  comfortableTouchTarget: 48,
  minFontSize: 11,
  maxFontSize: 48,
  minContrastRatio: 4.5,
};
export const animation = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  spring: {
    gentle: { tension: 120, friction: 14 },
    normal: { tension: 300, friction: 10 },
    bouncy: { tension: 400, friction: 10 },
  },
};
export const platform = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',
  elevation: (level: number) => ({
    elevation: level,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: level / 2 },
    shadowOpacity: 0.3,
    shadowRadius: level,
  }),
};
