import { createSheet } from '@/shared/ui/create-sheet';
import type { Theme } from '@/theme';

export function getStyles(theme: Theme) {
  const t = theme.colors;
  return createSheet({
    container: {
      backgroundColor: t.background.secondary,
      borderRadius: 16,
      padding: 20,
      shadowColor: t.semantic.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    loadingText: {
      color: t.text.tertiary,
      fontSize: 14,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    errorText: { color: t.error.DEFAULT, fontSize: 14, textAlign: 'center' },
    header: { marginBottom: 20 },
    monthName: {
      fontSize: 20,
      fontWeight: '700',
      color: t.text.primary,
      marginBottom: 8,
    },
    statsRow: { flexDirection: 'row', marginBottom: 4 },
    statText: { fontSize: 14, color: t.text.tertiary },
    statValueHighlight: {
      color: t.warning.DEFAULT,
      fontWeight: '700',
      fontSize: 16,
    },
    subStats: { flexDirection: 'row', alignItems: 'center' },
    subStat: { fontSize: 12, color: t.text.muted },
    subStatSeparator: {
      fontSize: 12,
      color: t.text.muted,
      marginHorizontal: 8,
    },
    weekdays: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: t.border.DEFAULT,
    },
    weekdayText: {
      width: 40,
      textAlign: 'center',
      fontSize: 11,
      color: t.text.muted,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    calendar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
    },
    day: {
      width: 40,
      height: 40,
      margin: 2,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: t.surface.card,
    },
    dayEmpty: { width: 40, height: 40, margin: 2 },
    dayToday: {
      borderWidth: 2,
      borderColor: t.warning.DEFAULT,
      shadowColor: t.warning.DEFAULT,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
    },
    dayText: { fontSize: 13, color: t.text.muted, fontWeight: '500' },
    dayTextActive: { color: t.text.inverse, fontWeight: '600' },
    dayTextStreak: { color: t.text.inverse, fontWeight: '700' },
    dayTextToday: { color: t.warning.DEFAULT, fontWeight: '700' },
    todayContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pulseRing: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: t.warning.DEFAULT,
      backgroundColor: 'transparent',
    },
    fireIndicator: { position: 'absolute', bottom: 2, right: 2 },
    fireEmoji: { fontSize: 10 },
    legend: {
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: t.border.DEFAULT,
    },
    legendRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
      marginBottom: 8,
    },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendGradientBox: { flexDirection: 'row', marginRight: 6, gap: 2 },
    legendToday: {
      backgroundColor: t.warning.DEFAULT,
      borderWidth: 1,
      borderColor: t.warning.DEFAULT,
    },
    legendText: { fontSize: 11, color: t.text.tertiary },
    legendEmoji: { fontSize: 12, marginRight: 4 },
  });
}

export type StreakCalendarStyles = ReturnType<typeof getStyles>;
