import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { Button } from '../../../components/primitives/Button';
import { Card } from '../../../components/primitives/Card';
import { Text } from '../../../components/primitives/Text';
import { EmptyState, ErrorState, Skeleton } from '../../../shared/ui/state-components';
import { useAuthStore } from '../../../store';
import { useTheme } from '../../../theme';
import { formatRelativeTime } from '../../../utils/date';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { SquadAnalytics } from '../analytics';
import { loadActiveSquadWar, watchActiveSquadWar } from '../squad-war-service';
import type { SquadWar, SquadWarMemberStatus } from '../squad-war-types';
import { createSheet } from '@/shared/ui/create-sheet';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

interface SquadWarHUDProps {
  squadId: string;
}

function formatTimeLeft(weekEndsAt: string, now: number): string {
  const diffMs = Math.max(0, new Date(weekEndsAt).getTime() - now);
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays >= 2) {
    return `${diffDays} days left`;
  }
  if (diffDays === 1) {
    return '1 day left';
  }
  if (diffHours > 1) {
    return `${diffHours}h left`;
  }
  return 'Ending soon';
}

function formatFocusingDuration(sessionStartedAt: number, now: number): string {
  const diffMinutes = Math.max(1, Math.floor((now - sessionStartedAt) / 60000));
  return `focusing ${diffMinutes}min`;
}

function getHealthColor(healthRatio: number): string {
  if (healthRatio > 0.6) {
    return '#22C55E';
  }
  if (healthRatio >= 0.3) {
    return '#F59E0B';
  }
  return '#EF4444';
}

function SquadWarMemberRow({ member, currentUserId, now, textColor, mutedColor }: { member: SquadWarMemberStatus; currentUserId: string | null; now: number; textColor: string; mutedColor: string }) {
  const pulseOpacity = useSharedValue(member.isCurrentlyFocusing ? 0.7 : 1);

  useEffect(() => {
    if (member.isCurrentlyFocusing) {
      pulseOpacity.value = withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(0.7, { duration: 1000 })), -1, false);
      return;
    }

    pulseOpacity.value = withTiming(1, { duration: 180 });
  }, [member.isCurrentlyFocusing, pulseOpacity]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const statusLabel = member.isCurrentlyFocusing && member.sessionStartedAt ? formatFocusingDuration(member.sessionStartedAt, now) : `last seen ${formatRelativeTime(member.lastSeenAt)}`;

  return (
    <Animated.View style={[styles.memberRow, rowStyle]}>
      <View style={styles.memberIdentity}>
        <View style={[styles.memberDot, { backgroundColor: member.isCurrentlyFocusing ? '#22C55E' : '#6B7280' }]} />
        <View style={styles.memberTextBlock}>
          <Text variant="body" style={[styles.memberName, { color: textColor }]}>
            {member.userId === currentUserId ? 'You' : member.displayName}
          </Text>
          <Text variant="caption" style={{ color: mutedColor }}>
            {statusLabel}
          </Text>
        </View>
      </View>
      <Text variant="body" style={[styles.memberDamage, { color: textColor }]}>
        +{member.damageContributed.toLocaleString()} dmg
      </Text>
    </Animated.View>
  );
}

export function SquadWarHUD({ squadId }: SquadWarHUDProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const currentUserId = user?.id ?? null;

  const [war, setWar] = useState<SquadWar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRealtimeDegraded, setIsRealtimeDegraded] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const [now, setNow] = useState(Date.now());

  const healthWidth = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const previousHealthRef = useRef<number | null>(null);

  const healthRatio = useMemo(() => {
    if (!war || war.bossMaxHealth <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(1, war.bossCurrentHealth / war.bossMaxHealth));
  }, [war]);

  const refreshWar = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const activeWar = await loadActiveSquadWar(squadId);
      setWar(activeWar);
    } catch (loadError) {
      setWar(null);
      setError(loadError instanceof Error ? loadError : new Error(String(loadError)));
    } finally {
      setIsLoading(false);
    }
  }, [squadId]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    void refreshWar();
    const intervalId = setInterval(() => {
      void refreshWar();
    }, 60000);

    const unsubscribe = watchActiveSquadWar(squadId, (nextWar) => {
      if (!isMounted) {
        return;
      }
      setWar(nextWar);
      setError(null);
      setIsRealtimeDegraded(false);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [refreshWar, squadId]);

  useEffect(() => {
    if (!barWidth || !war) {
      return;
    }

    const nextHealth = Math.max(0, Math.min(barWidth, barWidth * healthRatio));
    healthWidth.value = withTiming(nextHealth, { duration: 350 });

    if (previousHealthRef.current !== null && war.bossCurrentHealth < previousHealthRef.current) {
      flashOpacity.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 240 }));
    }

    previousHealthRef.current = war.bossCurrentHealth;
  }, [barWidth, flashOpacity, healthRatio, healthWidth, war]);

  const healthBarStyle = useAnimatedStyle(() => ({
    width: healthWidth.value,
  }));

  const healthFlashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const handleBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  if (isLoading) {
    return (
      <Card variant="elevated" size="lg" style={styles.card}>
        <Skeleton variant="text" width={180} height={18} />
        <View style={styles.loadingGap} />
        <Skeleton variant="text" width="60%" height={22} />
        <View style={styles.loadingGap} />
        <Skeleton variant="card" width="100%" height={18} />
        <View style={styles.memberList}>
          <Skeleton variant="list" count={4} height={42} />
        </View>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated" size="lg" style={styles.card}>
        <ErrorState
          error={error}
          title="Squad War unavailable"
          onRetry={() => {
            void refreshWar();
          }}
          retryLabel="Retry"
        />
      </Card>
    );
  }

  if (!war) {
    return (
      <Card variant="elevated" size="lg" style={styles.card}>
        <EmptyState icon="⚔️" title="No active Squad War this week" subtitle="Check back after the weekly reset to jump into the next boss race." />
      </Card>
    );
  }

  const healthPercent = Math.round(healthRatio * 100);
  const healthColor = getHealthColor(healthRatio);

  return (
    <Card variant="elevated" size="lg" style={styles.card}>
      {isRealtimeDegraded && (
        <View
          style={[
            styles.degradedBanner,
            {
              backgroundColor: theme.colors.warning.DEFAULT + '14',
              borderColor: theme.colors.warning.DEFAULT + '33',
            },
          ]}
        >
          <Text variant="caption" style={{ color: theme.colors.warning.DEFAULT }}>
            Live updates are delayed. Showing the last known war state.
          </Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <View style={styles.headerTitle}>
          <Text variant="bodySmall" style={[styles.kicker, { color: theme.colors.text.secondary }]}>
            ⚔️ SQUAD WAR
          </Text>
          <Text variant="caption" style={{ color: theme.colors.text.secondary }}>
            {formatTimeLeft(war.weekEndsAt, now)}
          </Text>
        </View>
        <View style={[styles.multiplierBadge, { backgroundColor: theme.colors.primary[500] + '1A' }]}>
          <Text variant="label" style={{ color: theme.colors.primary[500] }}>
            ×{war.rewardMultiplier.toFixed(1)}
          </Text>
        </View>
      </View>

      <Text variant="h3" style={[styles.bossName, { color: theme.colors.text.primary }]}>
        {war.bossName}
      </Text>

      <View style={styles.healthSection}>
        <View style={[styles.healthTrack, { backgroundColor: theme.colors.background.tertiary }]} onLayout={handleBarLayout}>
          <Animated.View style={[styles.healthFill, { backgroundColor: healthColor }, healthBarStyle]} />
          <Animated.View pointerEvents="none" style={[styles.healthFlash, healthFlashStyle]} />
        </View>
        <Text variant="caption" style={{ color: theme.colors.text.secondary }}>
          {healthPercent}% HP remaining
        </Text>
      </View>

      <View style={styles.memberList}>
        {war.members.map((member) => (
          <SquadWarMemberRow key={member.userId} member={member} currentUserId={currentUserId} now={now} textColor={theme.colors.text.primary} mutedColor={theme.colors.text.secondary} />
        ))}
      </View>

      <Button
        variant="primary"
        fullWidth
        onPress={() => {
          SquadAnalytics.squadWarStartTapped(squadId, war.id);
          navigation.navigate('SessionStack', {
            screen: 'SessionSetup',
            params: {
              warContext: {
                squadWarId: war.id,
                squadId,
              },
            },
          });
        }}
        accessibilityLabel="Start Session to Deal Damage button"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        Start Session to Deal Damage
      </Button>
    </Card>
  );
}

const styles = createSheet({
  card: {
    marginBottom: 24,
  },
  degradedBanner: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  loadingGap: {
    height: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  kicker: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  multiplierBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bossName: {
    marginTop: 16,
    marginBottom: 14,
    fontWeight: '700',
  },
  healthSection: {
    marginBottom: 18,
    gap: 8,
  },
  healthTrack: {
    height: 18,
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
  },
  healthFill: {
    height: '100%',
    borderRadius: 999,
  },
  healthFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  memberList: {
    gap: 10,
    marginBottom: 18,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  memberIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  memberTextBlock: {
    flex: 1,
  },
  memberName: {
    fontWeight: '600',
  },
  memberDamage: {
    fontWeight: '600',
  },
});

export default SquadWarHUD;
