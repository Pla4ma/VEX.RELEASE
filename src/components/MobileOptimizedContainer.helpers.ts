/**
 * Mobile layout helpers
 * Responsive sizing utilities extracted from MobileOptimizedContainer
 */
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');
export const isSmallScreen = height < 700;
export const isTablet = width > 768;

/**
 * Responsive Text Sizing
 * Adjusts font sizes for small screens
 */
export const getResponsiveFontSize = (baseSize: number): number => {
  if (isSmallScreen) {
    return Math.round(baseSize * 0.9);
  }
  if (isTablet) {
    return Math.round(baseSize * 1.1);
  }
  return baseSize;
};
