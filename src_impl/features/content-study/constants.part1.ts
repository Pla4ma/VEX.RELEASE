import { ContentSourceType, ContentStatus, StudyTask, QuizItem } from "./types";


export const CONTENT_STUDY_API = {
  BASE_URL: '/functions/v1/content-study',
  ENDPOINTS: {
    SUBMIT: 'submit',
    EXTRACT: 'extract',
    GENERATE: 'generate',
    STATUS: 'status',
    FEEDBACK: 'feedback',
  },
  TIMEOUT: 60000, // 60 seconds for generation
  POLL_INTERVAL: 2000, // 2 seconds between status checks
  MAX_POLL_ATTEMPTS: 30, // 60 seconds total polling
} as const;

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
    placeholder: 'Paste your study notes, article text, or any content you want to learn from...',
  },
  PDF: {
    label: 'Upload PDF',
    description: 'Upload lecture slides, readings, or documents',
    icon: 'file-pdf',
    acceptedTypes: ['application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
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
    color: 'theme.colors.primary[500]',
    isLoading: true,
    canGenerate: false,
  },
  EXTRACTING: {
    label: 'Extracting',
    description: 'Reading content...',
    color: 'theme.colors.primary[500]',
    isLoading: true,
    canGenerate: false,
  },
  EXTRACTED: {
    label: 'Extracted',
    description: 'Ready to generate study plan',
    color: 'theme.colors.primary[500]',
    isLoading: false,
    canGenerate: true,
  },
  PROCESSING: {
    label: 'Processing',
    description: 'AI is creating your study plan...',
    color: 'theme.colors.primary[500]',
    isLoading: true,
    canGenerate: false,
  },
  READY: {
    label: 'Ready',
    description: 'Study plan complete',
    color: 'theme.colors.primary[500]',
    isLoading: false,
    canGenerate: false,
  },
  FAILED: {
    label: 'Failed',
    description: 'Something went wrong',
    color: 'theme.colors.primary[500]',
    isLoading: false,
    canGenerate: false,
  },
};

export const STUDY_PLAN_CONFIG = {
  MIN_TASKS: 3,
  MAX_TASKS: 5,
  MIN_QUIZ_ITEMS: 3,
  MAX_QUIZ_ITEMS: 5,
  DEFAULT_TASK_DURATION: 15, // minutes
  MIN_TASK_DURATION: 5,
  MAX_TASK_DURATION: 60,
  DEFAULT_SESSION_DURATION: 1800, // 30 minutes
  MIN_SESSION_DURATION: 600, // 10 minutes
  MAX_SESSION_DURATION: 7200, // 2 hours
} as const;

export const TASK_PRIORITY_CONFIG = {
  HIGH: {
    label: 'High Priority',
    color: 'theme.colors.primary[500]',
    textColor: 'theme.colors.background.primary',
    weight: 3,
  },
  MEDIUM: {
    label: 'Medium Priority',
    color: 'theme.colors.primary[500]',
    textColor: 'theme.colors.primary[500]',
    weight: 2,
  },
  LOW: {
    label: 'Low Priority',
    color: 'theme.colors.primary[500]',
    textColor: 'theme.colors.background.primary',
    weight: 1,
  },
} as const;

export const QUIZ_DIFFICULTY_CONFIG = {
  EASY: {
    label: 'Easy',
    color: 'theme.colors.primary[500]',
    textColor: 'theme.colors.background.primary',
    weight: 1,
  },
  MEDIUM: {
    label: 'Medium',
    color: 'theme.colors.primary[500]',
    textColor: 'theme.colors.primary[500]',
    weight: 2,
  },
  HARD: {
    label: 'Hard',
    color: 'theme.colors.primary[500]',
    textColor: 'theme.colors.background.primary',
    weight: 3,
  },
} as const;