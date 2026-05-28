/**
 * UI Components Index
 * Premium reusable components with rich states and interactions
 */

// Animation & Transitions
export { TransitionWrapper, LayoutTransition } from "./TransitionWrapper";
export type {
  TransitionConfig,
  TransitionPreset,
  TransitionEasing,
} from "./TransitionWrapper";
export {
  EnterAnimation,
  StaggeredEnter,
  CardEnterAnimation,
  ScreenEnterAnimation,
  HeroEnterAnimation,
} from "./EnterAnimation";
export type {
  EnterAnimationProps,
  StaggeredEnterProps,
  EnterDirection,
  EnterSpeed,
} from "./EnterAnimation";

// Interactive Components
export {
  InteractiveCard,
  CardSkeleton as InteractiveCardSkeleton,
} from "./InteractiveCard";
export type { InteractiveCardProps } from "./InteractiveCard";

// Data Display
export { DataList, SelectionToolbar } from "./DataList";
export type { DataListProps, DataListItem, DataListSection } from "./DataList";

// FlashList optimized version (Phase 7A.1)
export { DataListFlashList, SelectionToolbar as DataListFlashListSelectionToolbar } from "./DataListFlashList";
export type { DataListFlashListProps, DataListItem as DataListFlashListItem, DataListSection as DataListFlashListSection } from "./DataListFlashList";

// Progress & Feedback
export { ProgressSteps } from "./ProgressSteps";
export type { Step, StepStatus, ProgressStepsProps } from "./ProgressSteps";
export {
  AnimatedCounter,
  useCountUp,
  useCounterAnimation,
} from "./AnimatedCounter";
export type {
  AnimatedCounterProps,
  CounterSize,
  CounterVariant,
} from "./AnimatedCounter";

// Witty Loading States (Phase 23.2)
export {
  WittyLoadingState,
  HomeLoadingState,
  BossLoadingState,
  LeaderboardLoadingState,
  CoachLoadingState,
  AchievementsLoadingState,
  ChallengesLoadingState,
  SquadLoadingState,
  ProfileLoadingState,
  AnalyticsLoadingState,
} from "./WittyLoadingState";
export type { LoadingContext } from "./WittyLoadingState";
export { Toast, ToastContainer, useToast } from "./Toast";
export type { ToastOptions, ToastItem, ToastType } from "./Toast";

// Form Components
export { FormField, FormSection, InputGroup } from "./FormField";
export type { FormFieldProps, FormSectionProps } from "./FormField";

// Navigation
export { TabBar, Breadcrumb } from "./TabBar";
export type { TabBarProps, TabItem, BreadcrumbProps } from "./TabBar";

// Polish Components - Design Cohesion
export { MicroRewardBanner, CompactRewardBadge } from "./MicroRewardBanner";
export type {
  MicroRewardBannerProps,
  CompactRewardBadgeProps,
} from "./MicroRewardBanner";
export type { RewardType } from "./micro-reward-helpers";

export {
  EnhancedSkeleton,
  SkeletonItem,
  CardSkeleton,
  HeroSkeleton,
  ListSkeleton,
  StatsSkeleton,
  TextBlockSkeleton,
  ScreenLoadingState,
} from "./EnhancedSkeleton";

export {
  StatusFeedback,
  InlineStatus,
  StatusChip,
  StatusBanner,
  CardStatusOverlay,
} from "./StatusFeedback";
export type { StatusFeedbackProps, AsyncStatus } from "./StatusFeedback";

// Empty States
export {
  EmptyState,
  InventoryEmptyState,
  FeedEmptyState,
  LeaderboardEmptyState,
  ChallengeEmptyState,
  ShopEmptyState,
  SquadWarsEmptyState,
  OfflineEmptyState,
  ErrorEmptyState,
} from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

// Error Boundaries
export {
  ScreenErrorBoundary,
  withScreenErrorBoundary,
  useScreenError,
} from "./ScreenErrorBoundary";
export type { ScreenErrorBoundaryProps } from "./ScreenErrorBoundary";

// Network Status
export { OfflineBanner } from "./OfflineBanner";
export type { OfflineBannerProps } from "./OfflineBanner";
