/**
 * Final Release Classification — machine-readable single source of truth.
 *
 * Every feature folder in src/features/ classified with exact permissions.
 * Tests enforce downstream configs match this source.
 * Docs generated from this file.
 */

import { z } from 'zod';

// ── Status ──

export const ClassificationStatusSchema = z.enum([
  'final_release_active',
  'final_release_progressive',
  'final_release_internal',
  'archived_or_deactivated',
  'test_or_legacy',
]);

export type ClassificationStatus = z.infer<typeof ClassificationStatusSchema>;

// ── Entry schema ──

export const FeatureClassificationEntrySchema = z.object({
  systemId: z.string().min(1),
  folder: z.string().min(1),
  status: ClassificationStatusSchema,
  featureKey: z.string().optional(),
  minSessions: z.number().int().min(0).optional(),
  routeAllowed: z.boolean(),
  homeAllowed: z.boolean(),
  queryAllowed: z.boolean(),
  subscriptionAllowed: z.boolean(),
  notificationAllowed: z.boolean(),
  completionAllowed: z.boolean(),
  premiumCopyAllowed: z.boolean(),
  appStoreCopyAllowed: z.boolean(),
  notes: z.string(),
});

export type FeatureClassificationEntry = z.infer<typeof FeatureClassificationEntrySchema>;

// ========================================================================
// CLASSIFICATION DATA — single source of truth
// ========================================================================

const ACTIVE: FeatureClassificationEntry[] = [
  { systemId:'focus_session', folder:'session', status:'final_release_active', featureKey:'focus_session', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Core session loop.' },
  { systemId:'session_start', folder:'session-start', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Session start flow.' },
  { systemId:'session_completion', folder:'session-completion', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Completion ledger + adaptive payoff. Does NOT include PostSessionStory (archived).' },
  { systemId:'home_experience', folder:'home-experience', status:'final_release_active', featureKey:'home_tab', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Adaptive Home.' },
  { systemId:'home_spine', folder:'home-spine', status:'final_release_active', featureKey:'home_tab', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Home navigation spine.' },
  { systemId:'today_system', folder:'today-system', status:'final_release_active', minSessions:0, routeAllowed:false, homeAllowed:true, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Minimal lane Today Strip. Home-only, no standalone route.' },
  { systemId:'ai_coach_basic', folder:'ai-coach', status:'final_release_active', featureKey:'ai_coach_basic', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Coach presence + basic companion. Advanced coach is progressive.' },
  { systemId:'coach_presence', folder:'coach-presence', status:'final_release_active', featureKey:'ai_coach_basic', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Coach presence rendering.' },
  { systemId:'progression', folder:'progression', status:'final_release_active', featureKey:'progress_view', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Streak/XP/level. Always active.' },
  { systemId:'streaks', folder:'streaks', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Streak tracking.' },
  { systemId:'focus_contract', folder:'focus-contract', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Session contracts.' },
  { systemId:'focus_identity', folder:'focus-identity', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Focus score.' },
  { systemId:'lane_engine', folder:'lane-engine', status:'final_release_active', minSessions:0, routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Canonical lane resolver. Internal decision boundary.' },
  { systemId:'focus_profile', folder:'focus-profile', status:'final_release_active', minSessions:0, routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Typed focus profile. Local-first until Supabase persistence is added.' },
  { systemId:'rescue_mode', folder:'rescue-mode', status:'final_release_active', minSessions:0, routeAllowed:false, homeAllowed:true, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Short recovery plans. Entry from session setup/home only.' },
  { systemId:'notification_policy', folder:'notification-policy', status:'final_release_active', minSessions:0, routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:true, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Nudge budget and lane notification rules.' },
  { systemId:'personal_bests', folder:'personal-bests', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Personal best tracking.' },
  { systemId:'session_history', folder:'session-history', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Past session viewing.' },
  { systemId:'session_recommendation', folder:'session-recommendation', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Next session suggestions.' },
  { systemId:'session_events', folder:'session-events', status:'final_release_active', minSessions:0, routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Session event bus. System-only.' },
  { systemId:'learning_execution', folder:'learning-execution', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Learning execution layer.' },
  { systemId:'notifications_system', folder:'notifications', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Notification system.' },
  { systemId:'onboarding', folder:'onboarding', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'One-time onboarding flow.' },
  { systemId:'personalization', folder:'personalization', status:'final_release_active', minSessions:0, routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Motivation adaptation engine. Internal.' },
  { systemId:'themes_visual', folder:'themes', status:'final_release_active', minSessions:0, routeAllowed:true, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Visual themes only. Shop modal is archived.' },
];

const PROGRESSIVE: FeatureClassificationEntry[] = [
  { systemId:'memory_console', folder:'focus-memory', status:'final_release_progressive', featureKey:'memory_console', minSessions:3, routeAllowed:true, homeAllowed:false, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Memory Console unlocks after 3 sessions. Inspectable, editable, deletable memory ledger.' },
  { systemId:'companion_detail', folder:'companion', status:'final_release_progressive', featureKey:'companion_detail', minSessions:3, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Companion visual detail. Unlocks at 3 sessions.' },
  { systemId:'challenges', folder:'challenges', status:'final_release_progressive', featureKey:'challenges', minSessions:5, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Challenges. Unlocks at 5.' },
  { systemId:'achievements', folder:'achievements', status:'final_release_progressive', featureKey:'achievements', minSessions:6, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Achievements. Unlocks at 6.' },
  { systemId:'boss', folder:'boss', status:'final_release_progressive', featureKey:'boss_tab', minSessions:7, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Boss momentum. Unlocks at 7.' },
  { systemId:'content_study', folder:'content-study', status:'final_release_progressive', featureKey:'content_study', minSessions:12, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Study/Deep Work entry. Unlocks at 12.' },
  { systemId:'study_os', folder:'study-os', status:'final_release_progressive', featureKey:'content_study', minSessions:12, routeAllowed:false, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:true, appStoreCopyAllowed:false, notes:'Student lane Study OS model. Uses content study gate.' },
  { systemId:'project_focus', folder:'project-focus', status:'final_release_progressive', featureKey:'content_study', minSessions:12, routeAllowed:false, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:true, appStoreCopyAllowed:false, notes:'Deep/creative project thread model. Uses content study gate until route ships.' },
  { systemId:'focus_run', folder:'focus-run', status:'final_release_progressive', featureKey:'boss_tab', minSessions:7, routeAllowed:false, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Game-like lane run model. Home/completion only until dedicated route ships.' },
  { systemId:'ai_coach_advanced', folder:'ai-coach', status:'final_release_progressive', featureKey:'ai_coach_advanced', minSessions:8, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:true, appStoreCopyAllowed:false, notes:'Deep Coach Memory. Premium-gated. Same folder as ai_coach_basic.' },
  { systemId:'content_study_advanced', folder:'content-study', status:'final_release_progressive', featureKey:'content_study_advanced', minSessions:18, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:true, appStoreCopyAllowed:false, notes:'Advanced Study OS. Premium-gated.' },
  { systemId:'quiz_review_mode', folder:'content-study', status:'final_release_progressive', featureKey:'quiz_review_mode', minSessions:10, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:true, completionAllowed:true, premiumCopyAllowed:true, appStoreCopyAllowed:false, notes:'Quiz/review. Premium-gated.' },
  { systemId:'advanced_settings', folder:'settings', status:'final_release_progressive', featureKey:'advanced_settings', minSessions:12, routeAllowed:true, homeAllowed:true, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:true, notes:'Settings & privacy. Unlocks at 12.' },
  { systemId:'premium_paywall', folder:'monetization', status:'final_release_progressive', featureKey:'premium_paywall', minSessions:40, routeAllowed:true, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:true, appStoreCopyAllowed:false, notes:'Premium paywall. minSessions=40 (was 5 in old map — corrected).' },
];

const INTERNAL: FeatureClassificationEntry[] = [
  { systemId:'reward_ledger', folder:'reward-ledger', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Internal reward accounting.' },
  { systemId:'rewards_service', folder:'rewards', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Reward delivery engine.' },
  { systemId:'economy_xp_ledger', folder:'economy', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'XP/streak ledger. User-facing wallet/shop/gems are archived.' },
  { systemId:'monetization_layer', folder:'monetization', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'RevenueCat + paywall layer. User-facing paywall is progressive.' },
  { systemId:'feature_gate', folder:'feature-gate', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Feature gate runtime.' },
  { systemId:'liveops_config', folder:'liveops-config', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Feature availability + health checks.' },
  { systemId:'analytics_telemetry', folder:'analytics', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Telemetry + Sentry.' },
  { systemId:'account_deletion', folder:'account-deletion', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Account management.' },
  { systemId:'integration', folder:'integration', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'External integration layer.' },
  { systemId:'companion_promise', folder:'companion-promise', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Companion promise infrastructure.' },
  { systemId:'unlock_explainer', folder:'unlock-explainer', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:true, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Unlock decision explainer service. No UI.' },
  { systemId:'memory_candidate', folder:'memory-candidate', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Memory candidate store for session completion memories.' },
  { systemId:'study_intelligence', folder:'study-intelligence', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Study intelligence analytics. Internal.' },
  { systemId:'vex_actions', folder:'vex-actions', status:'final_release_internal', routeAllowed:false, homeAllowed:false, queryAllowed:true, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'VEX action definitions and executors.' },
];

const ARCHIVED: FeatureClassificationEntry[] = [
  { systemId:'shop', folder:'shop', status:'archived_or_deactivated', featureKey:'shop', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Shop UI + economy. Deactivated.' },
  { systemId:'inventory', folder:'inventory', status:'archived_or_deactivated', featureKey:'inventory', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Item inventory. Deactivated.' },
  { systemId:'wallet', folder:'wallet', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Wallet UI. Deactivated.' },
  { systemId:'items', folder:'items', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Items data. Deactivated.' },
  { systemId:'battle_pass', folder:'battle-pass', status:'archived_or_deactivated', featureKey:'battle_pass', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Battle pass. Deactivated.' },
  { systemId:'squads', folder:'squads', status:'archived_or_deactivated', featureKey:'squads', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Squads. Deactivated.' },
  { systemId:'boss_realtime', folder:'boss-realtime', status:'archived_or_deactivated', featureKey:'boss_bounties', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Community boss realtime. Deactivated.' },
  { systemId:'spectacle', folder:'spectacle', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Visual spectacle. Deactivated.' },
  { systemId:'live_ops', folder:'live-ops', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Live ops. Deactivated.' },
  { systemId:'social', folder:'social', status:'archived_or_deactivated', featureKey:'social_tab', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Social feed. Deactivated.' },
  { systemId:'mastery', folder:'mastery', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Mastery. Deactivated.' },
  { systemId:'daily_mission', folder:'daily-mission', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Daily missions. Deactivated.' },
  { systemId:'weekly_quests', folder:'weekly-quests', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Weekly quests. Deactivated.' },
  { systemId:'retention', folder:'retention', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Retention hooks. Deactivated.' },
  { systemId:'emotion_retention', folder:'emotion-retention', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Emotional retention. Deactivated.' },
  { systemId:'monthly_report', folder:'monthly-report', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Monthly report. Deactivated.' },
  { systemId:'seasons', folder:'seasons', status:'archived_or_deactivated', featureKey:'seasonal_features', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Seasonal systems. Deactivated.' },
  { systemId:'session_story', folder:'session-story', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'PostSessionStory route. NOT session_completion narrative.' },
  { systemId:'themes_shop', folder:'themes', status:'archived_or_deactivated', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Theme shop. Same folder as themes_visual.' },
  { systemId:'economy_user_facing', folder:'economy', status:'archived_or_deactivated', featureKey:'economy_basic', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'User wallet/shop/rewards UI. XP ledger (internal) is active.' },
];

const LEGACY: FeatureClassificationEntry[] = [
  { systemId:'features_tests', folder:'__tests__', status:'test_or_legacy', routeAllowed:false, homeAllowed:false, queryAllowed:false, subscriptionAllowed:false, notificationAllowed:false, completionAllowed:false, premiumCopyAllowed:false, appStoreCopyAllowed:false, notes:'Cross-feature test directory.' },
];

// ── Combined ──

export const FINAL_RELEASE_CLASSIFICATION: readonly FeatureClassificationEntry[] = [
  ...ACTIVE,
  ...PROGRESSIVE,
  ...INTERNAL,
  ...ARCHIVED,
  ...LEGACY,
];

export { ACTIVE, PROGRESSIVE, INTERNAL, ARCHIVED, LEGACY };

export function validateClassification(): FeatureClassificationEntry[] {
  return z.array(FeatureClassificationEntrySchema).parse(FINAL_RELEASE_CLASSIFICATION);
}
