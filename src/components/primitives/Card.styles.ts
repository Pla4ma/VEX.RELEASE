import type { ViewStyle } from 'react-native';
import type { CardVariant, CardSize, CardState } from './Card';

export const variantStyles: Record<CardVariant, ViewStyle> = {
  default: {
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    borderColor: 'rgba(255, 255, 255, 0.74)',
    borderWidth: 1,
    shadowColor: 'rgba(13, 76, 65, 0.13)',
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  lightGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    borderColor: 'rgba(255, 255, 255, 0.74)',
    borderWidth: 1,
    shadowColor: 'rgba(13, 76, 65, 0.13)',
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  elevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    borderColor: 'rgba(255, 255, 255, 0.84)',
    borderWidth: 1,
    shadowColor: 'rgba(13, 76, 65, 0.22)',
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  lightHero: {
    backgroundColor: 'rgba(255, 255, 255, 0.66)',
    borderColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    shadowColor: '#0C765F',
    shadowOpacity: 0.18,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 20 },
    elevation: 10,
  },
  lightSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderColor: '#42CFAE',
    borderWidth: 1.4,
    shadowColor: '#18B894',
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  lightSuccess: {
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    borderColor: 'rgba(66, 207, 174, 0.45)',
    borderWidth: 1,
    shadowColor: '#18B894',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(13, 76, 65, 0.18)',
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    borderColor: 'rgba(255, 255, 255, 0.74)',
    borderWidth: 1,
    shadowColor: 'rgba(13, 76, 65, 0.13)',
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  premium: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderColor: 'rgba(121, 223, 201, 0.7)',
    borderWidth: 1.2,
    shadowColor: '#109779',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
};

export const sizeStyles: Record<CardSize, ViewStyle> = {
  sm: { borderRadius: 20, padding: 12 },
  md: { borderRadius: 24, padding: 16 },
  lg: { borderRadius: 28, padding: 20 },
};

export const stateStyles: Record<CardState, ViewStyle> = {
  default: {},
  loading: { opacity: 0.72 },
  disabled: { opacity: 0.62 },
  error: { borderColor: '#E05E5E', borderWidth: 1 },
  success: { borderColor: '#18B894', borderWidth: 1 },
};
