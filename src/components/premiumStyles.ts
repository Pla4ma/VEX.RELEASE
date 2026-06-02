import type { ViewStyle } from 'react-native';


export type PremiumCardSize = 'small' | 'medium' | 'large' | 'hero';

const PREMIUM_RADII: Record<PremiumCardSize, number> = {
  small: 16,
  medium: 20,
  large: 24,
  hero: 32,
};

export const premiumCardShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 6,
};

export function getPremiumCardStyle(size: PremiumCardSize): ViewStyle {
  return {
    borderRadius: PREMIUM_RADII[size],
    ...premiumCardShadow,
  };
}

export function withAlpha(hexColor: string, alpha: number): string {
  if (!hexColor.startsWith('#') || hexColor.length !== 7) {
    return hexColor;
  }

  const red = Number.parseInt(hexColor.slice(1, 3), 16);
  const green = Number.parseInt(hexColor.slice(3, 5), 16);
  const blue = Number.parseInt(hexColor.slice(5, 7), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
