import { createSheet } from '@/shared/ui/create-sheet';

export const styles = createSheet({
  container: { flex: 1 },
  indicatorContainer: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  indicator: {
    borderRadius: 20,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  indicatorArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: 2,
  },
});
