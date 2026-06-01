import type { FocusScoreHistoryPoint } from './types';

export function formatDelta(delta: number): string {
  return `${delta >= 0 ? '+' : ''}${delta}`;
}

export function formatFactorName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());
}

export function formatHistoryPoint(point: FocusScoreHistoryPoint): string {
  const date = new Date(point.timestamp);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}: ${point.score} (${formatDelta(point.delta)})`;
}
