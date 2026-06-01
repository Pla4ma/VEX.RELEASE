import { ExportJobSchema } from '../schemas';
import type { z } from 'zod';
import { launchColors } from '@theme/tokens/launch-colors';

export type ExportJob = z.infer<typeof ExportJobSchema>;

export interface ExportProgressProps {
  job: ExportJob;
  onDownload?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const STATUS_CONFIG = {
  pending: { color: launchColors.hex_6b7280, label: 'Queued', icon: '⏳' },
  processing: {
    color: launchColors.hex_3b82f6,
    label: 'Processing',
    icon: '⚙️',
  },
  completed: { color: launchColors.hex_10b981, label: 'Ready', icon: '✅' },
  failed: { color: launchColors.hex_ef4444, label: 'Failed', icon: '❌' },
  cancelled: { color: launchColors.hex_9ca3af, label: 'Cancelled', icon: '🚫' },
};

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
