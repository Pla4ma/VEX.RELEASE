import type { AvatarShape } from './Avatar.types';

export function getBorderRadius(shape: AvatarShape, sizeValue: number): number {
  switch (shape) {
    case 'circle':
      return sizeValue / 2;
    case 'rounded':
      return sizeValue / 4;
    case 'square':
      return 4;
    default:
      return sizeValue / 2;
  }
}