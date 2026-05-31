import type { ContentStatus, ContentSourceType } from '../types';
import type { ColorPalette } from '../../../theme';

type StatusColorKey = 'success' | 'warning' | 'error' | 'info';

export type StatusConfigEntry = {
  color: StatusColorKey;
  label: string;
  icon: string;
};

export const STATUS_FILTERS: Array<{ label: string; value: ContentStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Extracting', value: 'EXTRACTING' },
  { label: 'Ready', value: 'READY' },
];

export const TYPE_FILTERS: Array<{
  label: string;
  value: ContentSourceType | 'all';
  icon: string;
}> = [
  { label: 'All Types', value: 'all', icon: 'filter' },
  { label: 'PDF', value: 'PDF', icon: 'document' },
  { label: 'YouTube', value: 'YOUTUBE', icon: 'video' },
  { label: 'URL', value: 'URL', icon: 'link' },
  { label: 'Text', value: 'PASTE', icon: 'text' },
];

export const STATUS_CONFIG: Record<ContentStatus, StatusConfigEntry> = {
  PENDING: { color: 'warning', label: 'Pending', icon: 'clock' },
  EXTRACTING: { color: 'info', label: 'Extracting', icon: 'loader' },
  EXTRACTED: { color: 'success', label: 'Extracted', icon: 'check' },
  PROCESSING: { color: 'info', label: 'Processing', icon: 'loader' },
  READY: { color: 'success', label: 'Ready', icon: 'check-circle' },
  FAILED: { color: 'error', label: 'Failed', icon: 'alert' },
};

export const SOURCE_TYPE_ICONS: Record<ContentSourceType, string> = {
  PASTE: 'text',
  PDF: 'document',
  YOUTUBE: 'video',
  URL: 'link',
};

/** Resolve theme color from a status color key + DEFAULT suffix. */
export function statusColor(
  colors: ColorPalette,
  key: StatusColorKey,
): string {
  return colors[key].DEFAULT;
}
