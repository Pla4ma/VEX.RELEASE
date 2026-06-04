import { StyleSheet } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


const BAR_HEIGHT = 24;

export const styles = createSheet({
  container: { alignItems: 'center', paddingVertical: 16 },
  levelBadgeContainer: { marginBottom: 12 },
  barContainer: {
    position: 'relative',
    height: BAR_HEIGHT,
    justifyContent: 'center',
  },
  track: {
    height: BAR_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: lightColors.semantic.background,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: BAR_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tipGlow: {
    position: 'absolute',
    right: -4,
    top: -2,
    width: 8,
    height: BAR_HEIGHT + 4,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
  xpTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpText: { flexDirection: 'row', fontSize: 12, fontWeight: '700' },
  xpCurrent: { fontWeight: 'bold' },
  xpSeparator: { color: 'rgba(255,255,255,0.5)' },
  xpThreshold: { color: 'rgba(255,255,255,0.6)' },
  levelUpBadge: {
    position: 'absolute',
    right: 10,
    top: -30,
    backgroundColor: lightColors.semantic.vexGold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: lightColors.semantic.vexGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  levelUpText: {
    color: lightColors.semantic.background,
    fontWeight: 'bold',
    fontSize: 11,
  },
  totalXp: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
});
