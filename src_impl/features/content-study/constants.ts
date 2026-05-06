/**
 * Content Study Constants
 * V1 Implementation
 */

import { ContentSourceType, ContentStatus, StudyTask, QuizItem } from "./types";

// ============================================================================
// API Configuration
// ============================================================================

export const CONTENT_STUDY_API = {
  BASE_URL: "/functions/v1/content-study",
  ENDPOINTS: {
    SUBMIT: "submit",
    EXTRACT: "extract",
    GENERATE: "generate",
    STATUS: "status",
    FEEDBACK: "feedback",
  },
  TIMEOUT: 60000, // 60 seconds for generation
  POLL_INTERVAL: 2000, // 2 seconds between status checks
  MAX_POLL_ATTEMPTS: 30, // 60 seconds total polling
} as const;

// ============================================================================
// Content Source Configuration
// ============================================================================

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
    label: "Paste Notes",
    description: "Paste your notes or text directly",
    icon: "clipboard-text",
    placeholder: "Paste your study notes, article text, or any content you want to learn from...",
  },
  PDF: {
    label: "Upload PDF",
    description: "Upload lecture slides, readings, or documents",
    icon: "file-pdf",
    acceptedTypes: ["application/pdf"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  YOUTUBE: {
    label: "YouTube Video",
    description: "Study from video lectures or tutorials",
    icon: "play-circle",
    placeholder: "https://www.youtube.com/watch?v=...",
  },
  URL: {
    label: "Web Article",
    description: "Import articles from the web",
    icon: "link",
    placeholder: "https://example.com/article",
  },
};

// ============================================================================
// Status Configuration
// ============================================================================

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
    label: "Pending",
    description: "Waiting to process",
    color: "#9CA3AF",
    isLoading: true,
    canGenerate: false,
  },
  EXTRACTING: {
    label: "Extracting",
    description: "Reading content...",
    color: "#3B82F6",
    isLoading: true,
    canGenerate: false,
  },
  EXTRACTED: {
    label: "Extracted",
    description: "Ready to generate study plan",
    color: "#10B981",
    isLoading: false,
    canGenerate: true,
  },
  PROCESSING: {
    label: "Processing",
    description: "AI is creating your study plan...",
    color: "#8B5CF6",
    isLoading: true,
    canGenerate: false,
  },
  READY: {
    label: "Ready",
    description: "Study plan complete",
    color: "#10B981",
    isLoading: false,
    canGenerate: false,
  },
  FAILED: {
    label: "Failed",
    description: "Something went wrong",
    color: "#EF4444",
    isLoading: false,
    canGenerate: false,
  },
};

// ============================================================================
// Study Plan Configuration
// ============================================================================

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

// ============================================================================
// Priority Configuration
// ============================================================================

export const TASK_PRIORITY_CONFIG = {
  HIGH: {
    label: "High Priority",
    color: "#EF4444",
    textColor: "#FFFFFF",
    weight: 3,
  },
  MEDIUM: {
    label: "Medium Priority",
    color: "#F59E0B",
    textColor: "#111827",
    weight: 2,
  },
  LOW: {
    label: "Low Priority",
    color: "#10B981",
    textColor: "#FFFFFF",
    weight: 1,
  },
} as const;

// ============================================================================
// Quiz Difficulty Configuration
// ============================================================================

export const QUIZ_DIFFICULTY_CONFIG = {
  EASY: {
    label: "Easy",
    color: "#10B981",
    textColor: "#FFFFFF",
    weight: 1,
  },
  MEDIUM: {
    label: "Medium",
    color: "#F59E0B",
    textColor: "#111827",
    weight: 2,
  },
  HARD: {
    label: "Hard",
    color: "#EF4444",
    textColor: "#FFFFFF",
    weight: 3,
  },
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  RATE_LIMIT: "You have reached your daily limit of 10 study plans. Try again tomorrow!",
  FILE_TOO_LARGE: "File is too large. Maximum size is 10MB.",
  INVALID_FILE_TYPE: "Only PDF files are supported.",
  INVALID_YOUTUBE_URL: "Please enter a valid YouTube URL.",
  EMPTY_CONTENT: "Please enter some content to study.",
  EXTRACTION_FAILED: "Could not extract content. Please try a different file or paste the text directly.",
  GENERATION_FAILED: "Failed to generate study plan. Please try again.",
  NETWORK_ERROR: "Connection failed. Please check your internet and try again.",
  NOT_READY: "Content is still processing. Please wait a moment and try again.",
  DEFAULT: "Something went wrong. Please try again.",
} as const;

// ============================================================================
// UI Text
// ============================================================================

export const UI_TEXT = {
  // Input Screen
  INPUT_TITLE: "Study from Content",
  INPUT_SUBTITLE: "Upload or paste your study material",
  PASTE_TAB: "Paste",
  PDF_TAB: "PDF",
  YOUTUBE_TAB: "YouTube",
  SUBMIT_BUTTON: "Continue",
  UPLOAD_BUTTON: "Choose PDF File",
  UPLOAD_HINT: "Max 10MB, 100 pages",

  // Review Screen
  REVIEW_TITLE: "Review Content",
  REVIEW_SUBTITLE: "We extracted this from your source. Edit if needed.",
  EDIT_BUTTON: "Edit Text",
  SAVE_BUTTON: "Save Changes",
  GENERATE_BUTTON: "Generate Study Plan",
  GENERATING_BUTTON: "Generating...",

  // Study Plan Screen
  PLAN_TITLE: "Your Study Plan",
  SUMMARY_SECTION: "Summary",
  TASKS_SECTION: "Study Tasks",
  QUIZ_SECTION: "Practice Quiz",
  SESSION_SECTION: "Focus Session",
  START_SESSION_BUTTON: "Start Focus Session",
  SAVE_PACK_BUTTON: "Save Study Pack",
  RATE_PLAN_TITLE: "How was this study plan?",

  // Task Card
  TASK_ESTIMATED: "min",
  TASK_PRIORITY: "Priority",

  // Quiz Card
  QUIZ_SHOW_ANSWER: "Show Answer",
  QUIZ_HIDE_ANSWER: "Hide Answer",
  QUIZ_EXPLANATION: "Explanation",

  // Session Card
  SESSION_DURATION: "Duration",
  SESSION_DIFFICULTY: "Difficulty",
  SESSION_FOCUS_AREAS: "Focus Areas",

  // Feedback
  FEEDBACK_THANKS: "Thanks for your feedback!",
  FEEDBACK_HELPED: "This helped me study",
  FEEDBACK_NOT_HELPED: "This didn't help",
} as const;

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION_RULES = {
  YOUTUBE_URL_PATTERNS: [/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/, /youtu\.be\/([a-zA-Z0-9_-]{11})/, /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/],
  MIN_CONTENT_LENGTH: 100,
  MAX_CONTENT_LENGTH: 50000,
  MAX_TITLE_LENGTH: 200,
  MAX_FILENAME_LENGTH: 255,
} as const;

// ============================================================================
// Animation Config
// ============================================================================

export const ANIMATION_CONFIG = {
  TAB_SWITCH_DURATION: 200,
  CARD_ENTER_DURATION: 300,
  LOADING_PULSE_DURATION: 1500,
  SUCCESS_CHECK_DURATION: 500,
} as const;

// ============================================================================
// Analytics Events
// ============================================================================

export const ANALYTICS_EVENTS = {
  CONTENT_SUBMITTED: "content_submitted",
  CONTENT_EXTRACTED: "content_extracted",
  CONTENT_EDITED: "content_edited",
  STUDY_PLAN_GENERATED: "study_plan_generated",
  STUDY_PLAN_VIEWED: "study_plan_viewed",
  STUDY_PLAN_RATED: "study_plan_rated",
  SESSION_STARTED_FROM_PLAN: "session_started_from_plan",
  STUDY_PACK_SAVED: "study_pack_saved",
  RATE_LIMIT_HIT: "rate_limit_hit",
  GENERATION_FAILED: "generation_failed",
} as const;
