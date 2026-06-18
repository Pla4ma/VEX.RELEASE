import { Dimensions } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';

/** Get current screen width reactively — use in render context with `useWindowDimensions().width`. */
export const getScreenWidth = () => Dimensions.get('window').width;

/** Reactive styles for analytics dashboard — `screenWidth` updates on rotation. */
export const styles = createSheet({
  container: { flex: 1, backgroundColor: lightColors.surface.button },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: lightColors.text.inverse,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border.light,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: lightColors.semantic.backgroundMuted,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: lightColors.surface.button,
  },
  iconButtonText: { fontSize: 12, fontWeight: '700' },
  filtersContainer: {
    backgroundColor: lightColors.text.inverse,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border.light,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    get minWidth() { return (Dimensions.get('window').width - 56) / 2; },
    backgroundColor: lightColors.text.inverse,
    borderRadius: 12,
    padding: 16,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: lightColors.semantic.backgroundMuted,
  },
  summaryLabel: {
    fontSize: 12,
    color: lightColors.text.muted,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  changeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  changePositive: { backgroundColor: lightColors.success[50] },
  changeNegative: { backgroundColor: lightColors.error[50] },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    color: lightColors.text.muted,
  },
  chartsContainer: { marginBottom: 16 },
  insightsSection: { marginTop: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.semantic.backgroundMuted,
  },
  seeAllText: {
    fontSize: 14,
    color: lightColors.semantic.primary,
    fontWeight: '500',
  },
  partialWarning: {
    backgroundColor: lightColors.warning[50],
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  partialText: {
    fontSize: 12,
    color: lightColors.semantic.warning,
    textAlign: 'center',
  },
  skeletonContainer: { padding: 16, gap: 16 },
  skeletonTitle: { marginBottom: 8 },
  skeletonFilters: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  heatmapSkeleton: {
    backgroundColor: lightColors.text.inverse,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    gap: 12,
  },
  infoCard: {
    backgroundColor: lightColors.text.inverse,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: lightColors.semantic.backgroundMuted,
    marginBottom: 6,
  },
  infoSubtitle: {
    fontSize: 14,
    color: lightColors.text.muted,
    lineHeight: 20,
  },
});
