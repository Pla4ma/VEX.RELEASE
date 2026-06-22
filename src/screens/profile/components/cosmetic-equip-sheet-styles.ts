import type { ViewStyle } from 'react-native';

export const cosmeticEquipSheetStyles: Record<string, ViewStyle> = {
  overlay: {
    backgroundColor: 'rgba(10, 31, 26, 0.12)',
    justifyContent: 'flex-end',
  },
  card: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '85%',
  },
};
