export type {
  CompletionDailyMissionResult,
  CompletionLedger,
  CompletionReflection,
  CompletionReflectionInput,
  CompletionStreakResult,
  SessionCompletionGrade,
  SessionCompletionHero,
  SessionCompletionNavigationParams,
  SessionCompletionReturnPlan,
} from './schemas';

export type ShareableCustomization = {
  key: string;
  label: string;
  value: string;
};

export type ShareableTemplate = {
  id: string;
  name: string;
};
