import type { ViewStyle } from 'react-native';
import { glassMaterials } from '@/theme/tokens/vex-light-glass';
import type { NativeGlassSurfaceVariant } from './NativeGlassSurface.types';

export function getTintColor(variant: NativeGlassSurfaceVariant): string {
  switch (variant) {
    case 'selected':
      return 'rgba(95, 230, 197, 0.18)';
    case 'pill':
      return 'rgba(255, 255, 255, 0.16)';
    case 'nav':
      return 'rgba(255, 255, 255, 0.14)';
    case 'hero':
      return 'rgba(180, 245, 230, 0.12)';
    default:
      return 'rgba(255, 255, 255, 0.1)';
  }
}

export function getFallbackMaterial(
  variant: NativeGlassSurfaceVariant,
): ViewStyle {
  switch (variant) {
    case 'hero':
      return glassMaterials.hero as ViewStyle;
    case 'nav':
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.88)',
        borderWidth: 1.5,
        elevation: 14,
        shadowColor: 'rgba(6, 67, 56, 0.3)',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.2,
        shadowRadius: 28,
      };
    case 'pill':
    case 'selected':
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.26)',
        borderColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 999,
        borderWidth: 1.3,
      };
    case 'sheet':
      return glassMaterials.paneStrong as ViewStyle;
    default:
      return glassMaterials.pane as ViewStyle;
  }
}

export function getGlassEffectStyle(
  variant: NativeGlassSurfaceVariant,
): 'clear' | 'regular' {
  switch (variant) {
    case 'sheet':
      return 'regular';
    default:
      return 'clear';
  }
}

export const absoluteFill: ViewStyle = {
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
};
