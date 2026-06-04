import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const skeletonStyles = createSheet({
  container: { backgroundColor: lightColors.border.light, overflow: 'hidden' },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  textContainer: { gap: 8 },
  textLine: { marginBottom: 8 },
  cardContainer: {
    padding: 16,
    backgroundColor: lightColors.text.inverse,
    borderRadius: 12,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flex: 1, gap: 6 },
  headerLine: { marginBottom: 4 },
  button: { marginTop: 8 },
  personaContainer: { flexDirection: 'row', gap: 12 },
  personaCard: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: lightColors.text.inverse,
    borderRadius: 12,
    flex: 1,
  },
  personaName: { marginTop: 8 },
  listContainer: { gap: 12 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: lightColors.text.inverse,
    borderRadius: 8,
  },
  listContent: { flex: 1, gap: 6 },
  listLine: { marginBottom: 4 },
  streakContainer: { gap: 16 },
  streakContent: { padding: 16, gap: 12 },
  streakBadge: { alignSelf: 'center' },
  comebackContainer: {
    padding: 16,
    backgroundColor: lightColors.text.inverse,
    borderRadius: 12,
    gap: 16,
  },
  progressBar: { marginBottom: 8 },
  comebackContent: { gap: 12 },
});
