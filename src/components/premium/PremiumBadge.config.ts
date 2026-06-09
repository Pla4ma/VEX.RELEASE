import { lightColors } from '@/theme/tokens/colors';

export const sizeConfig = {
  sm: { badge: 16, font: 10, glow: 24 },
  md: { badge: 20, font: 12, glow: 32 },
  lg: { badge: 28, font: 16, glow: 44 },
};

export const variantConfig = {
  default: {
    backgroundColor: lightColors.accent.teal,
    borderColor: lightColors.accent.mint,
    textColor: lightColors.text.inverse,
  },
  subtle: {
    backgroundColor: lightColors.accent.mint,
    borderColor: lightColors.accent.mint,
    textColor: lightColors.accent.teal,
  },
  animated: {
    backgroundColor: lightColors.accent.teal,
    borderColor: lightColors.warning.light,
    textColor: lightColors.text.inverse,
  },
};

export const supporterSizeConfig = {
  sm: { badge: 18, font: 9, icon: 10 },
  md: { badge: 24, font: 11, icon: 14 },
  lg: { badge: 32, font: 14, icon: 18 },
};
