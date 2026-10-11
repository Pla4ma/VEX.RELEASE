import { createSheet } from '@/shared/ui/create-sheet';
import { vexFire } from '@/theme/tokens/vex-fire';

/** Default screen width fallback for static style computation. */
const DEFAULT_SCREEN_WIDTH = 375;

/** Reactive styles for analytics dashboard — pass `screenWidth` from `useWindowDimensions()` to component for true reactivity. */
export const styles = createSheet({
  container: { flex: 1, backgroundColor: vexFire.backgroundSoft },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: vexFire.panel,
    borderBottomWidth: 1,
    borderBottomColor: vexFire.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: vexFire.cream,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: vexFire.backgroundSoft,
  },
  iconButtonText: { fontSize: 12, fontWeight: '700' },
  filtersContainer: {
    backgroundColor: vexFire.panel,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: vexFire.border,
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
    minWidth: (DEFAULT_SCREEN_WIDTH - 56) / 2,
    backgroundColor: vexFire.panel,
    borderRadius: 12,
    padding: 16,
    shadowColor: vexFire.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: vexFire.cream,
  },
  summaryLabel: {
    fontSize: 12,
    color: vexFire.textMuted,
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
  changePositive: { backgroundColor: vexFire.backgroundSoft },
  changeNegative: { backgroundColor: vexFire.backgroundSoft },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    color: vexFire.textMuted,
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
    color: vexFire.cream,
  },
  seeAllText: {
    fontSize: 14,
    color: vexFire.ember,
    fontWeight: '500',
  },
  partialWarning: {
    backgroundColor: vexFire.backgroundSoft,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  partialText: {
    fontSize: 12,
    color: vexFire.amber,
    textAlign: 'center',
  },
  skeletonContainer: { padding: 16, gap: 16 },
  skeletonTitle: { marginBottom: 8 },
  skeletonFilters: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  heatmapSkeleton: {
    backgroundColor: vexFire.panel,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    gap: 12,
  },
  infoCard: {
    backgroundColor: vexFire.panel,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: vexFire.cream,
    marginBottom: 6,
  },
  infoSubtitle: {
    fontSize: 14,
    color: vexFire.textMuted,
    lineHeight: 20,
  },
});
