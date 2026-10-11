import { ContentSourceType, ContentStatus } from './types';
import { vexFire } from '@/theme/tokens/vex-fire';


const CONTENT_STUDY_FUNCTION_NAME = 'content-study';

export const CONTENT_STUDY_API = {
  FUNCTION_NAME: CONTENT_STUDY_FUNCTION_NAME,
  BASE_URL: '/functions/v1/content-study',
  ENDPOINTS: {
    SUBMIT: 'submit',
    EXTRACT: 'extract',
    GENERATE: 'generate',
    STATUS: 'status',
    FEEDBACK: 'feedback',
  },
  TIMEOUT: 60000,
  POLL_INTERVAL: 2000,
  MAX_POLL_ATTEMPTS: 30,
} as const;

export function getContentStudyFunctionName(path: string): string {
  const withoutLeadingSlash = path.trim().replace(/^\/+/, '');
  const route = withoutLeadingSlash.replace(/^functions\/v1\//, '');
  if (!route) throw new Error('Content study route is required');
  return route === CONTENT_STUDY_FUNCTION_NAME ||
    route.startsWith(`${CONTENT_STUDY_FUNCTION_NAME}/`)
    ? route
    : `${CONTENT_STUDY_FUNCTION_NAME}/${route}`;
}

export const CONTENT_SOURCES: Record<
  ContentSourceType,
  {
    label: string;
    description: string;
    icon: string;
    acceptedTypes?: string[];
    maxSize?: number;
    placeholder?: string;
  }
> = {
  PASTE: {
    label: 'Paste Notes',
    description: 'Paste your notes or text directly',
    icon: 'clipboard-text',
    placeholder:
      'Paste your study notes, article text, or any content you want to learn from...',
  },
  PDF: {
    label: 'Upload PDF',
    description: 'Upload lecture slides, readings, or documents',
    icon: 'file-pdf',
    acceptedTypes: ['application/pdf'],
    maxSize: 10 * 1024 * 1024,
  },
  YOUTUBE: {
    label: 'YouTube Video',
    description: 'Study from video lectures or tutorials',
    icon: 'play-circle',
    placeholder: 'https://www.youtube.com/watch?v=...',
  },
  URL: {
    label: 'Web Article',
    description: 'Import articles from the web',
    icon: 'link',
    placeholder: 'https://example.com/article',
  },
};

export const CONTENT_STATUS_CONFIG: Record<
  ContentStatus,
  {
    label: string;
    description: string;
    color: string;
    isLoading: boolean;
    canGenerate: boolean;
  }
> = {
  PENDING: {
    label: 'Pending',
    description: 'Waiting to process',
    color: vexFire.textMuted,
    isLoading: true,
    canGenerate: false,
  },
  EXTRACTING: {
    label: 'Extracting',
    description: 'Reading content...',
    color: vexFire.amber,
    isLoading: true,
    canGenerate: false,
  },
  EXTRACTED: {
    label: 'Extracted',
    description: 'Ready to generate study plan',
    color: vexFire.success,
    isLoading: false,
    canGenerate: true,
  },
  PROCESSING: {
    label: 'Processing',
    description: 'AI is creating your study plan...',
    color: vexFire.copper,
    isLoading: true,
    canGenerate: false,
  },
  READY: {
    label: 'Ready',
    description: 'Study plan complete',
    color: vexFire.success,
    isLoading: false,
    canGenerate: false,
  },
  FAILED: {
    label: 'Failed',
    description: 'Something went wrong',
    color: vexFire.danger,
    isLoading: false,
    canGenerate: false,
  },
};
