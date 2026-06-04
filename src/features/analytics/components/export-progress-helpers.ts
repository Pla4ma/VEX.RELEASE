import { ExportJobSchema } from '../schemas';
import type { z } from 'zod';
import { lightColors } from '@/theme/tokens/colors';

export type ExportJob = z.infer<typeof ExportJobSchema>;

export interface ExportProgressProps {
  job: ExportJob;
  onDownload?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const STATUS_CONFIG = {
  pending: { color: lightColors.text.muted, label: 'Queued', icon: '' },
  processing: {
    color: lightColors.accent.blue,
    label: 'Processing',
    icon: '',
  },
  completed: { color: lightColors.accent.green, label: 'Ready', icon: '' },
  failed: { color: lightColors.semantic.danger, label: 'Failed', icon: '' },
  cancelled: { color: lightColors.text.muted, label: 'Cancelled', icon: '' },
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
