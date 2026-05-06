import { captureSilentFailure } from '../../utils/silent-failure';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Box, Card, Text } from '../../components/primitives';
import { Skeleton } from '../../components/ui/Skeleton';
import { useWallet } from '../../features/economy/hooks';
import { getMasteryRankDisplay } from '../../features/mastery/types';
import { useProgressionSummary } from '../../features/progression/hooks';
import { useStreakSummary } from '../../features/streaks/hooks';
import { Icon } from '../../icons';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { getHeroGradientColors } from '../home/HomeScreenVisuals';
import { useSessionHistory, useSessionStats } from '../../session/hooks/useSession';
import { FocusScoreCard } from '../../features/focus-identity/components/FocusScoreCard';
import { ScoreHistoryChart } from '../../features/focus-identity/components/ScoreHistoryChart';
import type { SessionHistoryEntry } from '../../session/types';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';

type Props = NativeStackScreenProps<ExtendedRootStackParams, 'Main'>;
type Tab = 'stats' | 'achievements' | 'activity';
const masterySchema = z.object({
  userId: z.string(), totalMasteryPoints: z.number().nonnegative(), rank: z.enum(['APPRENTICE', 'ADEPT', 'EXPERT', 'MASTER', 'GRANDMASTER']),
  techniques: z.object({ durationMastery: z.number().min(0).max(25), purityMastery: z.number().min(0).max(25), consistencyMastery: z.number().min(0).max(25), comebackMastery: z.number().min(0).max(25), bossMastery: z.number().min(0).max(25) }),
  activeChallenges: z.array(z.object({ id: z.string(), technique: z.enum(['durationMastery', 'purityMastery', 'consistencyMastery', 'comebackMastery', 'bossMastery']), title: z.string(), description: z.string(), difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'ELITE']), target: z.number(), current: z.number(), unit: z.string(), masteryPoints: z.number(), status: z.enum(['ACTIVE', 'COMPLETED', 'CLAIMED']), completedAt: z.number().nullable() })),
  unlockedFeatures: z.array(z.string()), updatedAt: z.number(),
});
type MasteryState = z.infer<typeof masterySchema>;
const techniques: Array<{ key: keyof MasteryState['techniques']; label: string; color: string }> = [{ key: 'durationMastery', label: 'Duration', color: '#6366F1' }, { key: 'purityMastery', label: 'Purity', color: '#14B8A6' }, { key: 'consistencyMastery', label: 'Consistency', color: '#F97316' }, { key: 'comebackMastery', label: 'Comeback', color: '#EC4899' }, { key: 'bossMastery', label: 'Boss', color: '#EAB308' }];
const makeMastery = (userId: string): MasteryState => ({ userId, totalMasteryPoints: 0, rank: 'APPRENTICE', techniques: { durationMastery: 0, purityMastery: 0, consistencyMastery: 0, comebackMastery: 0, bossMastery: 0 }, activeChallenges: [], unlockedFeatures: [], updatedAt: Date.now() });
const hours = (ms: number) => `${Math.round((ms / 3600000) * 10) / 10}h`;
const when = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const minutes = (entry: SessionHistoryEntry) => `${Math.max(1, Math.round((entry.summary?.effectiveDuration ?? 0) / 60))} min`;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [mastery, setMastery] = useState<MasteryState>(makeMastery(user?.id ?? 'guest'));
  const [masteryLoading, setMasteryLoading] = useState(true);
  const userId = user?.id ?? null;
  const sheetRef = useRef<BottomSheet>(null);
  const progressionQuery = useProgressionSummary(userId);
  const streakQuery = useStreakSummary(userId);
  const statsQuery = useSessionStats(userId ?? '');
  const walletQuery = useWallet(userId ?? '');
  const historyQuery = useSessionHistory(userId ?? '', 20);
  const rankDisplay = getMasteryRankDisplay(mastery.rank);
  const headerColors = useMemo(() => [...getHeroGradientColors(streakQuery.data?.currentDays ?? 0)] as [string, string], [streakQuery.data?.currentDays]);
  const xpPercent = Math.max(0, Math.min(100, progressionQuery.data?.progressPercent ?? 0));
  const loading = progressionQuery.isLoading || streakQuery.isLoading || statsQuery.isLoading || walletQuery.isLoading;
  const stats = [
    { label: 'Current Streak', value: `${streakQuery.data?.currentDays ?? 0} days`, icon: 'fire', color: theme.colors.warning.DEFAULT },
    { label: 'Longest Streak', value: `${streakQuery.data?.longestDays ?? 0} days`, icon: 'calendar', color: theme.colors.error.DEFAULT },
    { label: 'Level', value: `${progressionQuery.data?.level ?? 1}`, icon: 'star', color: theme.colors.primary[500] },
    { label: 'Total Sessions', value: `${statsQuery.stats?.totalSessions ?? 0}`, icon: 'activity', color: theme.colors.info.DEFAULT },
    { label: 'Focus Hours', value: hours(statsQuery.stats?.totalFocusTime ?? 0), icon: 'clock', color: theme.colors.success.DEFAULT },
    { label: 'Coins', value: `${walletQuery.data?.coins ?? 0}`, icon: 'gem', color: theme.colors.warning.DEFAULT },
  ];
  const achievements = [
    { title: 'Momentum', description: `${streakQuery.data?.currentDays ?? 0} day current streak`, unlocked: (streakQuery.data?.currentDays ?? 0) > 0, icon: 'fire' },
    { title: 'Session Builder', description: `${statsQuery.stats?.totalSessions ?? 0} sessions completed`, unlocked: (statsQuery.stats?.totalSessions ?? 0) > 0, icon: 'activity' },
    { title: 'Level Climb', description: `Reached level ${progressionQuery.data?.level ?? 1}`, unlocked: (progressionQuery.data?.level ?? 1) > 1, icon: 'star' },
  ];

  useEffect(() => {
    let mounted = true;
    const loadMastery = async () => {
      if (!userId) { if (mounted) { setMastery(makeMastery('guest')); setMasteryLoading(false); } return; }
      setMasteryLoading(true);
      try {
        const raw = await getDefaultStorageAdapter().getItem(`mastery_${userId}`);
        const parsed = raw ? masterySchema.safeParse(JSON.parse(raw)) : null;
        if (mounted) {setMastery(parsed?.success ? parsed.data : makeMastery(userId));}
      } catch (error) { captureSilentFailure(error, { feature: 'screens', operation: 'ui-fallback', type: 'ui' });
        if (mounted) {setMastery(makeMastery(userId));}
      } finally {
        if (mounted) {setMasteryLoading(false);}
      }
    };
    void loadMastery();
    return () => { mounted = false; };
  }, [userId]);

  const renderStat = (item: (typeof stats)[number]) => (
    <Box key={item.label} style={{ width: '47%' }}>
      <Card size="md" style={{ backgroundColor: theme.colors.background.secondary }}>
        <Icon name={item.icon} size={20} color={item.color} />
        <Text variant="caption" color="text.tertiary" style={{ marginTop: 10 }}>{item.label}</Text>
        {loading ? <Skeleton width="70%" height={28} borderRadius={10} /> : <Text variant="h3" style={{ marginTop: 6, color: theme.colors.text.primary, fontWeight: '800' }}>{item.value}</Text>}
      </Card>
    </Box>
  );

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={headerColors} style={{ paddingTop: insets.top + theme.spacing[5], paddingHorizontal: theme.spacing[5], paddingBottom: theme.spacing[6], borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
          <Box flexDirection="row" justifyContent="space-between" mb={theme.spacing[4]}>
            <Pressable onPress={() => navigation.navigate('Settings', { screen: 'SettingsMain' })} style={{ padding: 8 }}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control"><Icon name="setting" size={24} color="#FFF" /></Pressable>
            <Box flexDirection="row" alignItems="center" gap={8}>
              <Pressable onPress={() => navigation.navigate('Notifications')} style={{ padding: 8 }}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control"><Icon name="notification" size={24} color="#FFF" /></Pressable>
              <Pressable onPress={logout} style={{ padding: 8 }}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control"><Icon name="logout" size={24} color="#FFF" /></Pressable>
            </Box>
          </Box>
          <Box alignItems="center">
            <Avatar name={user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'User'} size="xl" status="online" />
            <Text variant="h2" style={{ color: '#FFF', fontWeight: '800', marginTop: theme.spacing[4] }}>{user?.firstName || 'User'} {user?.lastName || ''}</Text>
            <Text variant="body" style={{ color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>{user?.email || 'No email available'}</Text>
            <Box flexDirection="row" mt={theme.spacing[3]}>
              <Badge variant="primary" size="sm" leftIcon="star">{`Level ${progressionQuery.data?.level ?? 1}`}</Badge>
              <Badge variant="success" size="sm" leftIcon="fire" style={{ marginLeft: 8 }}>{`${streakQuery.data?.currentDays ?? 0} Day Streak`}</Badge>
            </Box>
          </Box>
          <Box mt={theme.spacing[5]}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb={8}>
              <Text variant="caption" style={{ color: 'rgba(255,255,255,0.86)' }}>{`Level ${progressionQuery.data?.level ?? 1} | ${progressionQuery.data?.xp ?? 0}/${progressionQuery.data?.nextLevelThreshold ?? 100} XP`}</Text>
              <Text variant="caption" style={{ color: 'rgba(255,255,255,0.68)' }}>{`${Math.round(xpPercent)}%`}</Text>
            </Box>
            <Box height={6} borderRadius={999} overflow="hidden" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}><Box height="100%" borderRadius={999} style={{ width: `${xpPercent}%`, backgroundColor: '#FFF' }} /></Box>
          </Box>
        </LinearGradient>

        <Box p={16} gap={16}>
          <Box flexDirection="row" style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border.light }}>
            {(['stats', 'achievements', 'activity'] as const).map((tab) => <Pressable key={tab} onPress={() => setActiveTab(tab)} style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: activeTab === tab ? 2 : 0, borderBottomColor: theme.colors.primary[500] }}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control"><Text variant="body" style={{ color: activeTab === tab ? theme.colors.primary[500] : theme.colors.text.secondary, fontWeight: activeTab === tab ? '700' : '500', textTransform: 'capitalize' }}>{tab}</Text></Pressable>)}
          </Box>

          {activeTab === 'stats' ? <Box gap={16}>
            {(progressionQuery.error || streakQuery.error || walletQuery.error) ? <Card size="md" style={{ backgroundColor: theme.colors.background.secondary }}><Text variant="body" color="error.DEFAULT">Some profile data could not load. Pull to refresh or revisit this screen in a moment.</Text></Card> : null}
            {userId && (
              <FocusScoreCard
                userId={userId}
                size="large"
                showTrend={true}
                animate={true}
                onPress={() => {/* Navigate to score detail if available */}}
              />
            )}
            {userId && activeTab === 'stats' && (
              <ScoreHistoryChart
                userId={userId}
              />
            )}
            <Box flexDirection="row" flexWrap="wrap" gap={12}>{stats.map(renderStat)}</Box>
            <Pressable onPress={() => navigation.navigate('Mastery')} accessibilityLabel="View Mastery details" accessibilityRole="button" accessibilityHint="Opens the full mastery progression screen">
              <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}>
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb={12}>
                  <Box><Text variant="h4" color="text.primary">Mastery</Text><Text variant="caption" color="text.tertiary">{`${rankDisplay.icon} ${rankDisplay.title.toUpperCase()}`}</Text></Box>
                  {masteryLoading ? <Skeleton width={72} height={24} borderRadius={12} /> : <Badge variant="secondary" size="sm">{`${mastery.totalMasteryPoints} pts`}</Badge>}
                </Box>
                {masteryLoading ? <Skeleton lines={5} height={10} borderRadius={999} spacing={10} /> : techniques.map((tech) => <Box key={tech.key} mb={10}><Box flexDirection="row" justifyContent="space-between" mb={6}><Text variant="caption" color="text.secondary">{tech.label}</Text><Text variant="caption" color="text.tertiary">{`${mastery.techniques[tech.key]}/25`}</Text></Box><Box height={6} borderRadius={999} overflow="hidden" style={{ backgroundColor: theme.colors.background.tertiary }}><Box height="100%" borderRadius={999} style={{ width: `${(mastery.techniques[tech.key] / 25) * 100}%`, backgroundColor: tech.color }} /></Box></Box>)}
              </Card>
            </Pressable>
          </Box> : null}

          {activeTab === 'achievements' ? (loading ? <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}><Skeleton lines={6} height={22} borderRadius={10} spacing={12} /></Card> : <Box gap={12}>{achievements.map((item) => <Card key={item.title} size="md" style={{ backgroundColor: theme.colors.background.secondary, opacity: item.unlocked ? 1 : 0.7 }}><Box flexDirection="row" alignItems="center" gap={12}><Box width={44} height={44} borderRadius={12} justifyContent="center" alignItems="center" style={{ backgroundColor: item.unlocked ? theme.colors.primary[100] : theme.colors.background.tertiary }}><Icon name={item.icon} size={22} color={item.unlocked ? theme.colors.primary[500] : theme.colors.text.tertiary} /></Box><Box flex={1}><Text variant="h4" color="text.primary">{item.title}</Text><Text variant="caption" color="text.secondary">{item.description}</Text></Box><Badge variant={item.unlocked ? 'success' : 'secondary'} size="sm">{item.unlocked ? 'Unlocked' : 'In Progress'}</Badge></Box></Card>)}</Box>) : null}

          {activeTab === 'activity' ? (historyQuery.isLoading ? <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}><Skeleton lines={5} height={52} borderRadius={14} spacing={12} /></Card> : historyQuery.error ? <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}><EmptyState icon="!" title="Activity unavailable" body="We couldn't load your recent sessions right now." actionLabel="Start session" onAction={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })} /></Card> : historyQuery.history.length === 0 ? <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}><EmptyState icon="+" title="No recent activity" body="Start a session to turn your profile into a live record of wins, streaks, and progression." actionLabel="Start session" onAction={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })} /></Card> : <Box style={{ height: Math.max(360, historyQuery.history.length * 86) }}>
            <FlashList data={historyQuery.history} scrollEnabled={false} estimatedItemSize={86} keyExtractor={(item: SessionHistoryEntry) => item.sessionId} renderItem={({ item }: { item: SessionHistoryEntry }) => (
              <Card size="md" style={{ backgroundColor: theme.colors.background.secondary, marginBottom: 12 }}>
                <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Box flex={1}><Text variant="h4" color="text.primary">{item.config.customName || 'Focus Session'}</Text><Text variant="caption" color="text.secondary">{`${when(item.startedAt)} | ${minutes(item)}`}</Text></Box>
                  <Box alignItems="flex-end"><Badge variant={item.status === 'COMPLETED' ? 'success' : 'secondary'} size="sm">{item.status}</Badge><Text variant="caption" color="text.tertiary" style={{ marginTop: 6 }}>{`${item.summary?.xpEarned ?? 0} XP`}</Text></Box>
                </Box>
              </Card>
            )} />
          </Box>) : null}
        </Box>
      </ScrollView>

      <BottomSheet ref={sheetRef} index={-1} snapPoints={['60%', '90%']} enablePanDownToClose backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />} backgroundStyle={{ backgroundColor: theme.colors.background.secondary, borderWidth: 1, borderColor: theme.colors.border.light }} handleIndicatorStyle={{ backgroundColor: theme.colors.text.tertiary }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing[5], paddingVertical: theme.spacing[4], gap: theme.spacing[4] }}>
          <Text variant="h3" color="text.primary">{`${rankDisplay.icon} ${rankDisplay.title}`}</Text>
          <Text variant="body" color="text.secondary">{`${mastery.totalMasteryPoints} total mastery points`}</Text>
          {mastery.activeChallenges.length > 0 ? mastery.activeChallenges.slice(0, 3).map((challenge) => <Card key={challenge.id} size="md" style={{ backgroundColor: theme.colors.background.primary }}><Text variant="h4" color="text.primary">{challenge.title}</Text><Text variant="caption" color="text.secondary" style={{ marginTop: 4 }}>{challenge.description}</Text><Box height={8} borderRadius={999} overflow="hidden" mt={12} style={{ backgroundColor: theme.colors.background.tertiary }}><Box height="100%" borderRadius={999} style={{ width: `${Math.max(0, Math.min(100, (challenge.current / Math.max(1, challenge.target)) * 100))}%`, backgroundColor: theme.colors.primary[500] }} /></Box><Box flexDirection="row" justifyContent="space-between" mt={8}><Text variant="caption" color="text.tertiary">{`${challenge.current}/${challenge.target} ${challenge.unit}`}</Text><Text variant="caption" color="success.DEFAULT">{`+${challenge.masteryPoints} MP`}</Text></Box></Card>) : <Card size="md" style={{ backgroundColor: theme.colors.background.primary }}><Text variant="body" color="text.secondary">Complete sessions to unlock mastery challenges</Text></Card>}
        </ScrollView>
      </BottomSheet>
    </Box>
  );
};

export default ProfileScreen;
