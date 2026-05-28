import { ContentSourceType, ContentStatus } from "./types";
import { launchColors } from "@theme/tokens/launch-colors";

export const CONTENT_STUDY_API = {
  BASE_URL: "/functions/v1/content-study",
  ENDPOINTS: {
    SUBMIT: "submit",
    EXTRACT: "extract",
    GENERATE: "generate",
    STATUS: "status",
    FEEDBACK: "feedback",
  },
  TIMEOUT: 60000,
  POLL_INTERVAL: 2000,
  MAX_POLL_ATTEMPTS: 30,
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
    label: "Paste Notes",
    description: "Paste your notes or text directly",
    icon: "clipboard-text",
    placeholder:
      "Paste your study notes, article text, or any content you want to learn from...",
  },
  PDF: {
    label: "Upload PDF",
    description: "Upload lecture slides, readings, or documents",
    icon: "file-pdf",
    acceptedTypes: ["application/pdf"],
    maxSize: 10 * 1024 * 1024,
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
    color: launchColors.hex_9ca3af,
    isLoading: true,
    canGenerate: false,
  },
  EXTRACTING: {
    label: "Extracting",
    description: "Reading content...",
    color: launchColors.hex_3b82f6,
    isLoading: true,
    canGenerate: false,
  },
  EXTRACTED: {
    label: "Extracted",
    description: "Ready to generate study plan",
    color: launchColors.hex_10b981,
    isLoading: false,
    canGenerate: true,
  },
  PROCESSING: {
    label: "Processing",
    description: "AI is creating your study plan...",
    color: launchColors.hex_8b5cf6,
    isLoading: true,
    canGenerate: false,
  },
  READY: {
    label: "Ready",
    description: "Study plan complete",
    color: launchColors.hex_10b981,
    isLoading: false,
    canGenerate: false,
  },
  FAILED: {
    label: "Failed",
    description: "Something went wrong",
    color: launchColors.hex_ef4444,
    isLoading: false,
    canGenerate: false,
  },
};
