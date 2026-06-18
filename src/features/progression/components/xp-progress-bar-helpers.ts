import { lightColors } from '@/theme/tokens/colors';

export function getTierColor(lvl: number): [string, string] {
  if (lvl >= 50) {
    return [lightColors.semantic.vexGold, lightColors.semantic.warning];
  }
  if (lvl >= 25) {
    return [lightColors.text.disabled, lightColors.text.disabled];
  }
  if (lvl >= 10) {
    return [lightColors.text.muted, lightColors.text.muted];
  }
  return [lightColors.semantic.success, lightColors.semantic.success];
}
