import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';
import { rgbaColors } from '@/theme/tokens/rgba-colors';


const DAY_SIZE = 44;
const SPACING = 8;

export const styles = createSheet({
  container: {
    backgroundColor: lightColors.semantic.background,
    borderRadius: 20,
    padding: 20,
    margin: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: rgbaColors.rgb_255_107_53_0_2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: lightColors.semantic.warning,
  },
  streakEmoji: { fontSize: 24, marginRight: 8 },
  streakCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: lightColors.semantic.warning,
  },
  streakInfo: { marginLeft: 16, flex: 1 },
  streakLabel: { fontSize: 16, fontWeight: '600', color: lightColors.text.inverse },
  longestText: {
    fontSize: 12,
    color: rgbaColors.rgb_255_255_255_0_5,
    marginTop: 2,
  },
  riskBadge: { alignItems: 'center', padding: 8 },
  riskEmoji: { fontSize: 20 },
  riskText: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  progressContainer: { marginBottom: 20 },
  progressTrack: {
    height: 8,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: {
    fontSize: 11,
    color: rgbaColors.rgb_255_255_255_0_5,
    marginTop: 6,
    textAlign: 'right',
  },
  chainContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING,
    marginBottom: 16,
  },
  dayNode: { position: 'relative' },
  dayCircle: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_SIZE / 2,
    backgroundColor: lightColors.semantic.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveCircle: {
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderWidth: 2,
    borderColor: lightColors.semantic.backgroundElevated,
  },
  todayCircle: { borderWidth: 3, borderColor: lightColors.semantic.success },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: rgbaColors.rgb_255_255_255_0_3,
  },
  activeDayNumber: { color: lightColors.text.inverse },
  flameIcon: { position: 'absolute', top: -4, right: -4 },
  flameEmoji: { fontSize: 16 },
  milestoneBadge: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -8,
  },
  milestoneEmoji: { fontSize: 16 },
  connector: {
    position: 'absolute',
    right: -SPACING,
    top: '50%',
    width: SPACING,
    height: 4,
    marginTop: -2,
  },
  milestoneCard: {
    backgroundColor: rgbaColors.rgb_255_215_0_0_1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: rgbaColors.rgb_255_215_0_0_3,
    alignItems: 'center',
  },
  milestoneEmojiSmall: { fontSize: 20, marginBottom: 4 },
  milestoneText: {
    fontSize: 13,
    color: lightColors.text.inverse,
    textAlign: 'center',
    fontWeight: '600',
  },
  milestoneReward: {
    fontSize: 11,
    color: lightColors.semantic.vexGold,
    marginTop: 4,
  },
});
