/**
 * Mobile layout helpers
 * Responsive sizing utilities extracted from MobileOptimizedContainer
 */
import { Dimensions } from 'react-native';

/** Current small-screen threshold based on window height. Use `useWindowDimensions().height` for reactive updates. */
export const getIsSmallScreen = (height: number): boolean => height < 700;

/** Current tablet threshold based on window width. Use `useWindowDimensions().width` for reactive updates. */
export const getIsTablet = (width: number): boolean => width > 768;

/** @deprecated Use `getIsSmallScreen(useWindowDimensions().height)` instead for rotation-aware updates. */
export const isSmallScreen = Dimensions.get('window').height < 700;

/** @deprecated Use `getIsTablet(useWindowDimensions().width)` instead for rotation-aware updates. */
export const isTablet = Dimensions.get('window').width > 768;

/**
 * Responsive Text Sizing
 * Adjusts font sizes for small screens
 */
export const getResponsiveFontSize = (baseSize: number, height: number, width: number): number => {
  if (getIsSmallScreen(height)) {
    return Math.round(baseSize * 0.9);
  }
  if (getIsTablet(width)) {
    return Math.round(baseSize * 1.1);
  }
  return baseSize;
};