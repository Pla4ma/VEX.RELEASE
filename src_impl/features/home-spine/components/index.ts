/**
 * Home Spine Components
 *
 * Core home screen UI components for the VEX app.
 * @phase 1A-2
 */

// Phase 1A - Core Home Components
export { GreetingHeader, type GreetingHeaderProps } from './GreetingHeader';
// PHASE 7.3: StartSessionButton with Final Strike support
export { StartSessionButton, StartSessionButtonCompact, type StartSessionButtonProps } from './StartSessionButton';
export { StreakWidget, type StreakWidgetProps } from './StreakWidget';
// PHASE 7.3: BossPreviewCard with Final Strike support
export { BossPreviewCard, type BossPreviewCardProps } from './BossPreviewCard';
export { RecentSessionsList, type RecentSessionsListProps, type SessionListItem } from './RecentSessionsList';
// PHASE 7.4: TomorrowPreview with SessionPreview variant
export {
  TomorrowPreview,
  type TomorrowPreviewProps,
  TomorrowPreviewCompact,
  TomorrowPreviewSession,
  type TomorrowPreviewSessionProps,
} from './TomorrowPreview';
export { TodaysChallengesWidget, type TodaysChallengesWidgetProps, type ChallengeItem } from './TodaysChallengesWidget';
export { WeeklyCalendar, type WeeklyCalendarProps, type DayData, type DayStatus, type EventType } from './WeeklyCalendar';

// Phase 2 - Streak Defense Components
export { AtRiskBanner, type AtRiskBannerProps } from './AtRiskBanner';
export { ComebackQuestCard, type ComebackQuestCardProps } from './ComebackQuestCard';
export { GraceUsesIndicator, type GraceUsesIndicatorProps } from './GraceUsesIndicator';
export { StreakFreezeButton, type StreakFreezeButtonProps } from './StreakFreezeButton';
