import { lightColors } from '@/theme/tokens/colors';

export function getTierColor(level: number): [string, string] {
  if (level >= 50) {
    return [lightColors.semantic.vexGold, lightColors.semantic.warning];
  }
  if (level >= 25) {
    return [lightColors.text.disabled, lightColors.text.disabled];
  }
  if (level >= 10) {
    return [lightColors.text.muted, lightColors.text.muted];
  }
  return [lightColors.semantic.success, lightColors.semantic.success];
}
