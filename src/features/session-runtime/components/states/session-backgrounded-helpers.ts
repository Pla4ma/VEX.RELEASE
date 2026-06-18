export { formatDurationFromMs as formatDuration } from '../../../../utils/format-duration';

export function calculateProgressLoss(
  backgroundMs: number,
  currentProgress: number,
): number {
  const minutes = backgroundMs / 60000;
  const loss = Math.min(minutes * 1, 20);
  return Math.min(loss, currentProgress);
}
