/**
 * Content Study Domain Types
 * Core domain models for content study feature
 */

import type {
  ContentSourceType,
  TaskPriority,
  QuizDifficulty,
  SessionDifficulty,
} from "./enums";

export interface StudyTask {
  id: string;
  content: string;
  estimatedMinutes: number;
  priority: TaskPriority;
  dependsOn?: string[];
}

export interface QuizItem {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  explanation?: string;
  difficulty: QuizDifficulty;
  conceptTag: string;
}

export interface SessionPlan {
  recommendedDuration: number;
  recommendedSessions: number;
  breakIntervalMinutes: number;
  suggestedDifficulty: SessionDifficulty;
  focusAreas: string[];
}

export interface KeyConcept {
  id: string;
  term: string;
  definition: string;
  importance: "high" | "medium" | "low" | number;
}

export interface StudySummary {
  overview: string;
  keyPoints: string[];
  targetAudience: string[];
  prerequisites: string[];
}
