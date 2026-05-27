/**
 * Content Study Navigation Types
 * Stack navigation type definitions
 */

import type { ContentSourceType, InputTab } from "./enums";

export type ContentStudyStackParamList = {
  ContentInput: {
    draftId?: string;
    preferredTab?: InputTab;
    prefillData?: { text?: string; url?: string };
  };
  ContentReview: {
    contentId: string;
    autoStartGeneration?: boolean;
    highlightSection?: "text" | "metadata";
  };
  StudyPlan: {
    generationId: string;
    contentId: string;
    autoStartSession?: boolean;
    focusTaskId?: string;
  };
  ContentHistory: {
    filter?: ContentSourceType | "all";
    sortBy?: "newest" | "oldest" | "most-used";
  };
  ContentDetail: {
    contentId: string;
    tab?: "overview" | "tasks" | "quiz" | "sessions";
  };
};
