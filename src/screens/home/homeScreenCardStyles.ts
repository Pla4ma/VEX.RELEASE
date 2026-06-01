import { createSheet } from '@/shared/ui/create-sheet';

export const styles = createSheet({
  barFill: { height: '100%' },
  barTrack: { flex: 1, height: 10, overflow: 'hidden' },
  card: { borderWidth: 1 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  studyCard: { gap: 12 },
});

export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
