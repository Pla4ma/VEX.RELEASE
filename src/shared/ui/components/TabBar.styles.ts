import { StyleSheet } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import { rgbaColors } from '@/theme/tokens/rgba-colors';


export const styles = createSheet({
  container: { width: '100%' },
  tabsContainer: { flexDirection: 'row' },
  horizontal: { flexDirection: 'row', alignItems: 'center' },
  vertical: { flexDirection: 'column' },
  scrollContent: { paddingHorizontal: 4 },
  scrollContentVertical: { paddingVertical: 4 },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWithLabel: { marginRight: 8 },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeSmall: { minWidth: 14, height: 14, top: 0, right: 0 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextSmall: { fontSize: 8 },
  disabledOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: rgbaColors.rgb_0_0_0_0_3,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  underlineIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    borderRadius: 1,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  breadcrumbItem: { paddingVertical: 4 },
  breadcrumbItemActive: { fontWeight: '600' },
  separator: { marginHorizontal: 8 },
});
