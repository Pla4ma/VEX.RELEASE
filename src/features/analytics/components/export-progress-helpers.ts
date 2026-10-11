import { vexFire } from "@/theme/tokens/vex-fire";
import { ExportJobSchema } from '../schemas';
import type { z } from 'zod';


export type ExportJob = z.infer<typeof ExportJobSchema>;

export interface ExportProgressProps {
  job: ExportJob;
  onDownload?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const STATUS_CONFIG = {
  pending: { color: vexFire.textMuted, label: 'Queued', icon: '' },
  processing: {
    color: vexFire.amber,
    label: 'Processing',
    icon: '',
  },
  completed: { color: vexFire.success, label: 'Ready', icon: '' },
  failed: { color: vexFire.danger, label: 'Failed', icon: '' },
  cancelled: { color: vexFire.textMuted, label: 'Cancelled', icon: '' },
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
