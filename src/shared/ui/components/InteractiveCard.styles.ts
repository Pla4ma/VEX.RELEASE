import type { ViewStyle } from 'react-native';

export const fullWidth: ViewStyle = { width: '100%' };
export const card: ViewStyle = { overflow: 'hidden', position: 'relative' };
export const selected: ViewStyle = { borderWidth: 2 };
export const errorCard: ViewStyle = { borderWidth: 1 };
export const badge: ViewStyle = {
  position: 'absolute',
  top: 8,
  right: 8,
  minWidth: 24,
  height: 24,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
};
export const badgeText: ViewStyle = { fontSize: 10, fontWeight: '700' };
export const iconContainer: ViewStyle = { marginBottom: 8 };
export const contentStyle: ViewStyle = { flex: 1 };
