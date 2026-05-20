import { useState, useCallback, useEffect, useRef } from "react"; import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native"; import { useAuth } from "../../../auth/hooks/useAuth"; import { useAnalytics } from "../../../analytics/hooks/useAnalytics";
import { eventBus } from "../../../events"; import { calculateStreakRisk, checkAndSendRiskNotifications, type StreakRiskStatus } from "../streak-risk-monitor";
import { fetchRiskStatusEnhanced, saveRiskStatusEnhanced, fetchStreakEnhanced } from "../repository/enhanced";
import { StreakRiskStatusSchema, type RiskLevel } from "../schemas-enhanced"; import { launchColors } from "@theme/tokens/launch-colors"; const QUERY_KEYS = {
riskStatus: (userId: string) => ["streaks", "risk", userId], streak: (userId: string) => ["streaks", "data", userId], }; const RISK_CHECK_INTERVAL = 60 * 1000;
const STALE_TIME = 30 * 1000; interface UseStreakRiskReturn { riskStatus: StreakRiskStatus | null; riskLevel: RiskLevel; hoursRemaining: number; minutesRemaining: number;
flameHealthPercent: number; isAtRisk: boolean; isCritical: boolean; currentStreak: number; isLoading: boolean; isChecking: boolean; isRefreshing: boolean; error: Error | null;
checkRisk: () => Promise<void>; refresh: () => Promise<void>; retry: () => void; flameColor: string; urgencyLabel: string; shouldShowWarning: boolean; shouldShowCritical: boolean;
notificationSent: boolean; } function getFlameColor(healthPercent: number): string { if (healthPercent > 75) { return launchColors.hex_4caf50; } if (healthPercent > 50) {
return launchColors.hex_ff9800; } if (healthPercent > 25) { return launchColors.hex_ff5722; } return launchColors.hex_f44336; }
function getUrgencyLabel(riskLevel: RiskLevel): string { const labels: Record<RiskLevel, string> = { NONE: "Safe", LOW: "Stable", MEDIUM: "Warning", HIGH: "Urgent",
CRITICAL: "CRITICAL", }; return labels[riskLevel]; } export function useStreakRisk(): UseStreakRiskReturn { const { userId } = useAuth(); const queryClient = useQueryClient();
const { track } = useAnalytics(); const intervalRef = useRef<NodeJS.Timeout | null>(null); const [isChecking, setIsChecking] = useState(false); const { data: streakData,
isLoading: isStreakLoading, error: streakError, refetch: refetchStreak, } = useQuery({ queryKey: QUERY_KEYS.streak(userId || ""), queryFn: async () => { if (!userId) { return null;
} const result = await fetchStreakEnhanced(userId); if (result.error) { throw result.error; } return result.data; }, enabled: !!userId, staleTime: STALE_TIME, retry: 3, }); const {
data: cachedRiskStatus, isLoading: isRiskLoading, error: riskError, refetch: refetchRisk, } = useQuery({ queryKey: QUERY_KEYS.riskStatus(userId || ""), queryFn: async () => {
if (!userId) { return null; } const result = await fetchRiskStatusEnhanced(userId); if (result.error) { throw result.error; } if (!result.data) { return null; }
return StreakRiskStatusSchema.parse(result.data); }, enabled: !!userId, staleTime: STALE_TIME, retry: 3, }); const riskStatus = (() => { if (!streakData) {
return cachedRiskStatus || null; } const freshRisk = calculateStreakRisk(streakData); if (cachedRiskStatus) { return { ...freshRisk,
notificationsSent: cachedRiskStatus.notificationsSent, }; } return freshRisk; })(); const checkRiskMutation = useMutation({ mutationFn: async () => { if (!userId || !streakData) {
return null; } setIsChecking(true); try { const currentRisk = calculateStreakRisk(streakData); await checkAndSendRiskNotifications(userId);
const saveResult = await saveRiskStatusEnhanced({ ...currentRisk, lastUpdated: currentRisk.lastUpdated || Date.now(), notificationsSent: cachedRiskStatus?.notificationsSent || [],
}); if (saveResult.error) { throw saveResult.error; } if (currentRisk.isAtRisk) { track("streak_risk_detected", { riskLevel: currentRisk.riskLevel,
hoursRemaining: currentRisk.hoursRemaining, streakDays: currentRisk.currentDays, }); } return currentRisk; } finally { setIsChecking(false); } }, onSuccess: (data) => {
if (data && userId) { queryClient.setQueryData(QUERY_KEYS.riskStatus(userId), data); } }, onError: (error) => { Sentry.captureException(error, { tags: { feature: "streaks",
hook: "useStreakRisk", operation: "checkRisk", }, }); }, }); useEffect(() => { if (!userId) { return; } checkRiskMutation.mutate(); intervalRef.current = setInterval(() => {
checkRiskMutation.mutate(); }, RISK_CHECK_INTERVAL); return () => { if (intervalRef.current) { clearInterval(intervalRef.current); } };
}, [checkRiskMutation, userId, streakData?.currentDays]); useEffect(() => { if (!userId) { return; } const handleStreakUpdated = () => {
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.streak(userId) }); queryClient.invalidateQueries({ queryKey: QUERY_KEYS.riskStatus(userId), }); };
eventBus.subscribe("streak:updated", handleStreakUpdated); eventBus.subscribe("streak:session_completed", handleStreakUpdated); return () => {
eventBus.unsubscribe("streak:updated", handleStreakUpdated); eventBus.unsubscribe("streak:session_completed", handleStreakUpdated); }; }, [userId, queryClient]);
const checkRisk = useCallback(async () => { await checkRiskMutation.mutateAsync(); }, [checkRiskMutation]); const refresh = useCallback(async () => {
await Promise.all([refetchStreak(), refetchRisk()]); await checkRisk(); }, [refetchStreak, refetchRisk, checkRisk]); const retry = useCallback(() => {
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.streak(userId || ""), }); queryClient.invalidateQueries({ queryKey: QUERY_KEYS.riskStatus(userId || ""), });
}, [queryClient, userId]); const isLoading = isStreakLoading || isRiskLoading; const error = (streakError || riskError || checkRiskMutation.error) as Error | null;
const isRefreshing = checkRiskMutation.isPending; const flameColor = getFlameColor(riskStatus?.flameHealthPercent ?? 100);
const urgencyLabel = getUrgencyLabel(riskStatus?.riskLevel || "NONE"); const shouldShowWarning = riskStatus?.riskLevel === "MEDIUM" || riskStatus?.riskLevel === "HIGH";
const shouldShowCritical = riskStatus?.riskLevel === "CRITICAL"; const notificationSent = (riskStatus?.notificationsSent.length || 0) > 0; return { riskStatus,
riskLevel: riskStatus?.riskLevel || "NONE", hoursRemaining: riskStatus?.hoursRemaining ?? 24, minutesRemaining: riskStatus?.minutesRemaining ?? 1440,
flameHealthPercent: riskStatus?.flameHealthPercent ?? 100, isAtRisk: riskStatus?.isAtRisk ?? false, isCritical: riskStatus?.isCritical ?? false,
currentStreak: streakData?.currentDays ?? 0, isLoading, isChecking, isRefreshing, error, checkRisk, refresh, retry, flameColor, urgencyLabel, shouldShowWarning, shouldShowCritical,
notificationSent, }; } export function useFlameHealth(): { healthPercent: number; color: string; isAtRisk: boolean; } {
const { flameHealthPercent, flameColor, isAtRisk } = useStreakRisk(); return { healthPercent: flameHealthPercent, color: flameColor, isAtRisk }; }
