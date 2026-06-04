import { lightColors } from '@/theme/tokens/colors';


export const STUDY_PLAN_CONFIG = {
  MIN_TASKS: 3,
  MAX_TASKS: 5,
  MIN_QUIZ_ITEMS: 3,
  MAX_QUIZ_ITEMS: 5,
  DEFAULT_TASK_DURATION: 15,
  MIN_TASK_DURATION: 5,
  MAX_TASK_DURATION: 60,
  DEFAULT_SESSION_DURATION: 1800,
  MIN_SESSION_DURATION: 600,
  MAX_SESSION_DURATION: 7200,
} as const;

export const TASK_PRIORITY_CONFIG = {
  HIGH: {
    label: 'High Priority',
    color: lightColors.semantic.danger,
    textColor: lightColors.text.inverse,
    weight: 3,
  },
  MEDIUM: {
    label: 'Medium Priority',
    color: lightColors.semantic.warning,
    textColor: lightColors.semantic.backgroundMuted,
    weight: 2,
  },
  LOW: {
    label: 'Low Priority',
    color: lightColors.accent.green,
    textColor: lightColors.text.inverse,
    weight: 1,
  },
} as const;

export const QUIZ_DIFFICULTY_CONFIG = {
  EASY: {
    label: 'Easy',
    color: lightColors.accent.green,
    textColor: lightColors.text.inverse,
    weight: 1,
  },
  MEDIUM: {
    label: 'Medium',
    color: lightColors.semantic.warning,
    textColor: lightColors.semantic.backgroundMuted,
    weight: 2,
  },
  HARD: {
    label: 'Hard',
    color: lightColors.semantic.danger,
    textColor: lightColors.text.inverse,
    weight: 3,
  },
} as const;

export const ERROR_MESSAGES = {
  RATE_LIMIT:
    'You have reached your daily limit of 10 study plans. Try again tomorrow!',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Only PDF files are supported.',
  INVALID_YOUTUBE_URL: 'Please enter a valid YouTube URL.',
  EMPTY_CONTENT: 'Please enter some content to study.',
  EXTRACTION_FAILED:
    'Could not extract content. Please try a different file or paste the text directly.',
  GENERATION_FAILED: 'Failed to generate study plan. Please try again.',
  NETWORK_ERROR:
    'Connection failed. Please check your internet and try again.',
  NOT_READY: 'Content is still processing. Please wait a moment and try again.',
  DEFAULT: 'Something went wrong. Please try again.',
} as const;

export const UI_TEXT = {
  INPUT_TITLE: 'Study from Content',
  INPUT_SUBTITLE: 'Upload or paste your study material',
  PASTE_TAB: 'Paste',
  PDF_TAB: 'PDF',
  YOUTUBE_TAB: 'YouTube',
  SUBMIT_BUTTON: 'Continue',
  UPLOAD_BUTTON: 'Choose PDF File',
  UPLOAD_HINT: 'Max 10MB, 100 pages',
  REVIEW_TITLE: 'Review Content',
  REVIEW_SUBTITLE: 'We extracted this from your source. Edit if needed.',
  EDIT_BUTTON: 'Edit Text',
  SAVE_BUTTON: 'Save Changes',
  GENERATE_BUTTON: 'Generate Study Plan',
  GENERATING_BUTTON: 'Generating...',
  PLAN_TITLE: 'Your Study Plan',
  SUMMARY_SECTION: 'Summary',
  TASKS_SECTION: 'Study Tasks',
  QUIZ_SECTION: 'Practice Quiz',
  SESSION_SECTION: 'Focus Session',
  START_SESSION_BUTTON: 'Start Focus Session',
  SAVE_PACK_BUTTON: 'Save Study Pack',
  RATE_PLAN_TITLE: 'How was this study plan?',
  TASK_ESTIMATED: 'min',
  TASK_PRIORITY: 'Priority',
  QUIZ_SHOW_ANSWER: 'Show Answer',
  QUIZ_HIDE_ANSWER: 'Hide Answer',
  QUIZ_EXPLANATION: 'Explanation',
  SESSION_DURATION: 'Duration',
  SESSION_DIFFICULTY: 'Difficulty',
  SESSION_FOCUS_AREAS: 'Focus Areas',
  FEEDBACK_THANKS: 'Thanks for your feedback!',
  FEEDBACK_HELPED: 'This helped me study',
  FEEDBACK_NOT_HELPED: "This didn't help",
} as const;

export const VALIDATION_RULES = {
  YOUTUBE_URL_PATTERNS: [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ],
  MIN_CONTENT_LENGTH: 100,
  MAX_CONTENT_LENGTH: 50000,
  MAX_TITLE_LENGTH: 200,
  MAX_FILENAME_LENGTH: 255,
} as const;

export const ANIMATION_CONFIG = {
  TAB_SWITCH_DURATION: 200,
  CARD_ENTER_DURATION: 300,
  LOADING_PULSE_DURATION: 1500,
  SUCCESS_CHECK_DURATION: 500,
} as const;

export const ANALYTICS_EVENTS = {
  CONTENT_SUBMITTED: 'content_submitted',
  CONTENT_EXTRACTED: 'content_extracted',
  CONTENT_EDITED: 'content_edited',
  STUDY_PLAN_GENERATED: 'study_plan_generated',
  STUDY_PLAN_VIEWED: 'study_plan_viewed',
  STUDY_PLAN_RATED: 'study_plan_rated',
  SESSION_STARTED_FROM_PLAN: 'session_started_from_plan',
  STUDY_PACK_SAVED: 'study_pack_saved',
  RATE_LIMIT_HIT: 'rate_limit_hit',
  GENERATION_FAILED: 'generation_failed',
} as const;
