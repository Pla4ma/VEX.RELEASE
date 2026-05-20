import { eventBus } from "../../events"; import { capture } from "../../shared/analytics/analytics-service";
import { SessionEvents } from "../../shared/analytics/analytics-events"; import type { SessionHistoryEntry, InterruptionRecord, AntiCheatFlag, RecoveryRecord } from "../types";
import { createDebugger } from "../../utils/debug"; const debug = createDebugger("session:analytics"); interface SessionAnalyticsEvent { eventName: string; userId: string;
sessionId?: string; timestamp: number; properties: Record<string, unknown>; } interface EngagementMetrics { totalSessions: number; completedSessions: number;
abandonedSessions: number; completionRate: number; avgSessionDuration: number; totalFocusTime: number; } interface PatternMetrics { bestTimeOfDay: number; bestDayOfWeek: number;
avgInterruptionsPerSession: number; recoverySuccessRate: number; avgFocusQuality: number; } export class SessionAnalytics { private userId: string | null = null;
private eventQueue: SessionAnalyticsEvent[] = []; private metrics: EngagementMetrics | null = null; private patterns: PatternMetrics | null = null;
setUserId(userId: string): void { this.userId = userId; this.setupEventListeners(); } private setupEventListeners(): void { if (!this.userId) { return; }
eventBus.subscribe("session:created", (data) => { if (!data) { return; } this.track("session_created", { sessionId: data.sessionId, userId: data.userId, config: data.config,
timestamp: data.timestamp, }); }); eventBus.subscribe("session:started", (data) => { if (!data) { return; } capture(SessionEvents.SESSION_STARTED, { session_id: data.sessionId,
user_id: this.userId ?? "", session_type: "focus", started_at: data.startedAt, }); this.track("session_started", { sessionId: data.sessionId, startedAt: data.startedAt,
phase: data.phase, }); }); eventBus.subscribe("session:completed", (data) => { if (!data) { return; }
const summary = data.summary && typeof data.summary === "object" ? (data.summary as Record<string, unknown>) : {};
const durationSeconds = data.duration || (typeof summary.effectiveDuration === "number" ? summary.effectiveDuration : 0);
const completionPercentage = typeof summary.completionPercentage === "number" ? summary.completionPercentage : 100;
const xpEarned = typeof summary.xpEarned === "number" ? summary.xpEarned : 0; const coinsEarned = typeof summary.coinsEarned === "number" ? summary.coinsEarned : 0;
capture(SessionEvents.SESSION_COMPLETED, { session_id: data.sessionId, user_id: data.userId, duration_seconds: durationSeconds, completion_percentage: completionPercentage,
session_type: "focus", xp_earned: xpEarned, coins_earned: coinsEarned, }); this.track("session_completed", { sessionId: data.sessionId, userId: data.userId, summary: data.summary,
duration: data.duration, }); }); eventBus.subscribe("session:abandoned", (data) => { if (!data) { return; } const elapsedSeconds = data.elapsedTime || 0; const totalDuration = 0;
const completionPercentage = totalDuration > 0 ? Math.round((elapsedSeconds / totalDuration) * 100) : 0; capture(SessionEvents.SESSION_ABANDONED, { session_id: data.sessionId,
user_id: data.userId, reason: data.reason || "unknown", elapsed_seconds: elapsedSeconds, completion_percentage: completionPercentage, purity_score: 0, });
this.track("session_abandoned", { sessionId: data.sessionId, userId: data.userId, reason: data.reason, elapsedTime: data.elapsedTime, abandonedAt: data.abandonedAt, }); });
eventBus.subscribe("session:interruption", (data) => { if (!data) { return; } this.track("session_interrupted", { sessionId: data.sessionId, userId: data.userId,
interruption: data.interruption, }); }); eventBus.subscribe("session:recovery:successful", (data) => { if (!data) { return; } this.track("session_recovered", {
sessionId: data.sessionId, userId: data.userId, recoveredAt: data.recoveredAt, recoveredTime: data.recoveredTime, }); }); eventBus.subscribe("session:anticheat:flag", (data) => {
if (!data) { return; } this.track("anti_cheat_flag", { sessionId: data.sessionId, userId: data.userId, flag: data.flag, }); });
eventBus.subscribe("session:phase:changed", (data) => { if (!data) { return; } this.track("phase_transition", { sessionId: data.sessionId, previousPhase: data.previousPhase,
newPhase: data.newPhase, timestamp: data.timestamp, }); }); eventBus.subscribe("session:tick", (data) => { if (!data) { return; } this.track("session_tick", {
sessionId: data.sessionId, elapsed: data.elapsed, remaining: data.remaining, percentage: data.percentage, phase: data.phase, }); });
eventBus.subscribe("session:rewards:granted", (data) => { if (!data) { return; } this.track("rewards_earned", { sessionId: data.sessionId, userId: data.userId,
rewards: data.rewards, timestamp: data.timestamp, }); }); eventBus.subscribe("session:failed", (data) => { if (!data) { return; } this.track("session_error", {
sessionId: data.sessionId, userId: data.userId, error: data.error, canRecover: data.canRecover, }); }); eventBus.subscribe("session:sync:failed", (data) => { if (!data) { return; }
this.track("sync_failure", { sessionId: data.sessionId, userId: data.userId, error: data.error, willRetry: data.willRetry, }); }); }
private track(eventName: string, properties: Record<string, unknown>): void { if (!this.userId) { return; } const event: SessionAnalyticsEvent = { eventName, userId: this.userId,
sessionId: properties.sessionId as string, timestamp: Date.now(), properties, }; this.eventQueue.push(event); if (this.eventQueue.length >= 50) { this.flush(); }
eventBus.publish("analytics:track", { event: eventName, properties: { ...properties, userId: this.userId }, }); }
async calculateEngagementMetrics(history: SessionHistoryEntry[]): Promise<EngagementMetrics> { const totalSessions = history.length;
const completedSessions = history.filter((h) => h.status === "COMPLETED").length; const abandonedSessions = history.filter((h) => h.status === "ABANDONED").length;
const totalFocusTime = history.reduce((acc, h) => { return acc + (h.summary?.effectiveDuration || 0); }, 0);
const avgSessionDuration = totalSessions > 0 ? totalFocusTime / totalSessions : 0; this.metrics = { totalSessions, completedSessions, abandonedSessions,
completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0, avgSessionDuration, totalFocusTime, }; return this.metrics; }
async calculatePatternMetrics(history: SessionHistoryEntry[], recoveries: RecoveryRecord[]): Promise<PatternMetrics> { const hourCounts = new Array(24).fill(0);
history.forEach((h) => { const hour = new Date(h.startedAt).getHours(); if (h.status === "COMPLETED") { hourCounts[hour]++; } });
const bestTimeOfDay = hourCounts.indexOf(Math.max(...hourCounts)); const dayCounts = new Array(7).fill(0); history.forEach((h) => { const day = new Date(h.startedAt).getDay();
if (h.status === "COMPLETED") { dayCounts[day]++; } }); const bestDayOfWeek = dayCounts.indexOf(Math.max(...dayCounts));
const avgInterruptionsPerSession = history.length > 0 ? history.reduce((acc, h) => acc + (h.summary?.interruptions || 0), 0) / history.length : 0;
const recoverySuccessRate = recoveries.length > 0 ? (recoveries.filter((r) => r.successful).length / recoveries.length) * 100 : 0;
const avgFocusQuality = history.length > 0 ? history.reduce((acc, h) => acc + (h.summary?.focusQuality || 0), 0) / history.length : 0; this.patterns = { bestTimeOfDay,
bestDayOfWeek, avgInterruptionsPerSession, recoverySuccessRate, avgFocusQuality, }; return this.patterns; }
trackMilestone(sessionId: string, milestone: string, data: Record<string, unknown>): void { this.track(`milestone_${milestone}`, { sessionId, ...data }); }
trackAntiCheatIncident(flag: AntiCheatFlag): void { this.track("anti_cheat_incident", { sessionId: flag.sessionId, type: flag.type, severity: flag.severity,
actionTaken: flag.actionTaken, score: flag.score, }); } trackInterruptionImpact(interruption: InterruptionRecord): void { this.track("interruption_impact", {
sessionId: interruption.sessionId, type: interruption.type, severity: interruption.severity, timeLost: interruption.impact.timeLost, scoreImpact: interruption.impact.scoreImpact,
autoRecovered: interruption.autoRecovered, }); } trackFunnelStep(step: string, sessionId: string, success: boolean, duration?: number): void { this.track("funnel_step", { step,
sessionId, success, duration, timestamp: Date.now(), }); } flush(): void { if (this.eventQueue.length === 0) { return; } const events = [...this.eventQueue]; this.eventQueue = [];
debug.info("[Analytics Batch]", { userId: this.userId, events, timestamp: Date.now(), }); } getQueuedEvents(): SessionAnalyticsEvent[] { return [...this.eventQueue]; }
getMetrics(): EngagementMetrics | null { return this.metrics; } getPatterns(): PatternMetrics | null { return this.patterns; } }
let sessionAnalytics: SessionAnalytics | null = null; export function getSessionAnalytics(): SessionAnalytics { if (!sessionAnalytics) { sessionAnalytics = new SessionAnalytics();
} return sessionAnalytics; } export default SessionAnalytics;
