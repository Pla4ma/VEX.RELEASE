/**
 * Session Consequence Cards
 *
 * PHASE 7.2 - Post-session consequence display
 *
 * Shows specific consequence cards after session completion:
 * - Boss Impact: boss health bar animated from pre to post
 * - Streak Consequence: streak day completion, next milestone
 * - Challenge Impact: challenge progress before and after
 * - Rival Impact: gap closed or opened
 *
 * Displayed in horizontal scroll row, ordered by most impactful.
 *
 * @phase 7.2
 */

import React, { useRef, useEffect } from 'react';
import { ScrollView, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInRight,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;

// ============================================================================
// Types
// ============================================================================

export interface SessionConsequenceCardsProps {
  /** Boss consequence data */
  bossConsequence?: {
    bossName: string;
    healthBefore: number; // 0-100
    healthAfter: number; // 0-100
    damageDealt: number;
    wasDefeated: boolean;
    hadCriticalHit: boolean;
    bountyConsumedCount?: number; // Phase 4: Number of bounties consumed
    bountyLootMultiplier?: number; // Phase 4: Total loot multiplier applied
  } | null;

  /** Streak consequence data */
  streakConsequence?: {
    previousDays: number;
    currentDays: number;
    nextMilestone: number;
    daysUntilMilestone: number;
    streakSaved: boolean; // If was at risk before
  } | null;

  /** Challenge consequence data */
  challengeConsequence?: {
    challengeName: string;
    progressBefore: number;
    progressAfter: number;
    target: number;
    wasCompleted: boolean;
  } | null;

  /** Rival consequence data */
  rivalConsequence?: {
    rivalName: string;
    gapBefore: number; // negative means ahead, positive means behind
    gapAfter: number;
    minutesGained: number;
  } | null;
}

// ============================================================================
// Boss Impact Card
// ============================================================================

function BossImpactCard({
  bossName,
  healthBefore,
  healthAfter,
  damageDealt,
  wasDefeated,
  hadCriticalHit,
  bountyConsumedCount,
  bountyLootMultiplier,
}: NonNullable<SessionConsequenceCardsProps['bossConsequence']>): JSX.Element {
  const { theme } = useTheme();
  const healthAnim = useSharedValue(healthBefore);

  useEffect(() => {
    healthAnim.value = withSpring(healthAfter, { damping: 15, stiffness: 100 });
  }, [healthAfter, healthAnim]);

  const healthBarStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, healthAnim.value)}%`,
  }));

  return (
    <View
      style={{
        width: CARD_WIDTH,
        padding: theme.spacing[4],
        backgroundColor: wasDefeated
          ? `${theme.colors.success[500]}15`
          : theme.colors.background.secondary,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: wasDefeated ? theme.colors.success[500] : theme.colors.border.DEFAULT,
        marginRight: theme.spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[2] }}>
        <Text fontSize={24}>{wasDefeated ? '🏆' : '🐲'}</Text>
        <Text variant="body" fontWeight="700" color="text.primary">
          {wasDefeated ? 'BOSS DEFEATED!' : bossName}
        </Text>
      </View>

      {/* Health Bar */}
      <View
        style={{
          height: 12,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden',
          marginBottom: theme.spacing[2],
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: wasDefeated
                ? theme.colors.success[500]
                : healthAfter <= 15
                  ? theme.colors.error[500]
                  : theme.colors.primary[500],
              borderRadius: theme.borderRadius.full,
            },
            healthBarStyle,
          ]}
        />
      </View>

      <Text variant="caption" color="text.secondary">
        {wasDefeated
          ? `You dealt ${damageDealt} damage and defeated the boss!`
          : `${healthAfter.toFixed(0)}% health remaining • ${damageDealt} damage dealt`}
      </Text>

      {hadCriticalHit && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[1],
            marginTop: theme.spacing[2],
            padding: theme.spacing[2],
            backgroundColor: `${theme.colors.warning[500]}20`,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <Text fontSize={16}>⚡</Text>
          <Text variant="caption" color="warning.DEFAULT" fontWeight="600">
            Critical Hit!
          </Text>
        </View>
      )}

      {/* Phase 4: Bounty Applied Indicator */}
      {bountyConsumedCount && bountyConsumedCount > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[1],
            marginTop: theme.spacing[2],
            padding: theme.spacing[2],
            backgroundColor: `${theme.colors.warning[500]}15`,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <Text fontSize={16}>🎯</Text>
          <Text variant="caption" color="warning.500" fontWeight="600">
            Bounty × {bountyConsumedCount} — {bountyLootMultiplier ?? 2}× loot applied
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Streak Consequence Card
// ============================================================================

function StreakConsequenceCard({
  previousDays,
  currentDays,
  nextMilestone,
  daysUntilMilestone,
  streakSaved,
}: NonNullable<SessionConsequenceCardsProps['streakConsequence']>): JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      style={{
        width: CARD_WIDTH,
        padding: theme.spacing[4],
        backgroundColor: streakSaved
          ? `${theme.colors.error[500]}15`
          : `${theme.colors.accent.orange}15`,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: streakSaved ? theme.colors.error[500] : theme.colors.accent.orange,
        marginRight: theme.spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[2] }}>
        <Text fontSize={24}>{streakSaved ? '🔥💨' : '🔥'}</Text>
        <Text variant="body" fontWeight="700" color="text.primary">
          {streakSaved ? 'Streak Saved!' : `Day ${currentDays} Complete`}
        </Text>
      </View>

      <Text variant="body" color="text.secondary" style={{ marginBottom: theme.spacing[2] }}>
        {streakSaved
          ? 'You were at risk, but this session saved your streak!'
          : `Your ${currentDays}-day streak is alive and burning.`}
      </Text>

      <View
        style={{
          padding: theme.spacing[3],
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <Text variant="caption" color="text.tertiary">
          NEXT MILESTONE
        </Text>
        <Text variant="body" fontWeight="600" color="text.primary">
          Day {nextMilestone} in {daysUntilMilestone} days
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// Challenge Impact Card
// ============================================================================

function ChallengeImpactCard({
  challengeName,
  progressBefore,
  progressAfter,
  target,
  wasCompleted,
}: NonNullable<SessionConsequenceCardsProps['challengeConsequence']>): JSX.Element {
  const { theme } = useTheme();
  const progressAnim = useSharedValue(progressBefore);

  useEffect(() => {
    progressAnim.value = withTiming(progressAfter, { duration: 1000 });
  }, [progressAfter, progressAnim]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, (progressAnim.value / target) * 100)}%`,
  }));

  return (
    <View
      style={{
        width: CARD_WIDTH,
        padding: theme.spacing[4],
        backgroundColor: wasCompleted
          ? `${theme.colors.success[500]}15`
          : theme.colors.background.secondary,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: wasCompleted ? theme.colors.success[500] : theme.colors.border.DEFAULT,
        marginRight: theme.spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[2] }}>
        <Text fontSize={24}>{wasCompleted ? '📋✅' : '📋'}</Text>
        <Text variant="body" fontWeight="700" color="text.primary" numberOfLines={1}>
          {wasCompleted ? 'Challenge Complete!' : challengeName}
        </Text>
      </View>

      {/* Progress Bar */}
      <View
        style={{
          height: 8,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden',
          marginBottom: theme.spacing[2],
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: wasCompleted ? theme.colors.success[500] : theme.colors.primary[500],
              borderRadius: theme.borderRadius.full,
            },
            progressBarStyle,
          ]}
        />
      </View>

      <Text variant="caption" color="text.secondary">
        {wasCompleted
          ? `Completed! ${progressBefore} → ${progressAfter}/${target}`
          : `Progress: ${progressBefore} → ${progressAfter}/${target}`}
      </Text>
    </View>
  );
}

// ============================================================================
// Rival Impact Card
// ============================================================================

function RivalImpactCard({
  rivalName,
  gapBefore,
  gapAfter,
  minutesGained,
}: NonNullable<SessionConsequenceCardsProps['rivalConsequence']>): JSX.Element {
  const { theme } = useTheme();

  const gainedGround = gapAfter < gapBefore;
  const nowAhead = gapAfter < 0 && gapBefore >= 0;

  return (
    <View
      style={{
        width: CARD_WIDTH,
        padding: theme.spacing[4],
        backgroundColor: gainedGround
          ? `${theme.colors.success[500]}15`
          : `${theme.colors.error[500]}15`,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: gainedGround ? theme.colors.success[500] : theme.colors.error[500],
        marginRight: theme.spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[2] }}>
        <Text fontSize={24}>{nowAhead ? '⚔️👑' : '⚔️'}</Text>
        <Text variant="body" fontWeight="700" color="text.primary">
          {rivalName}
        </Text>
      </View>

      <Text variant="body" color="text.secondary" style={{ marginBottom: theme.spacing[2] }}>
        {nowAhead
          ? `You overtook ${rivalName}!`
          : gainedGround
            ? `You closed the gap by ${minutesGained} minutes!`
            : `${rivalName} pulled ahead by ${Math.abs(minutesGained)} minutes`}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: theme.spacing[3],
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <View>
          <Text variant="caption" color="text.tertiary">BEFORE</Text>
          <Text variant="body" color={gapBefore <= 0 ? 'success.DEFAULT' : 'error.DEFAULT'}>
            {gapBefore === 0 ? 'Tied' : gapBefore < 0 ? `${Math.abs(gapBefore)} min ahead` : `${gapBefore} min behind`}
          </Text>
        </View>
        <Text fontSize={20}>{gainedGround ? '→' : '←'}</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="caption" color="text.tertiary">NOW</Text>
          <Text variant="body" color={gapAfter <= 0 ? 'success.DEFAULT' : 'error.DEFAULT'} fontWeight="600">
            {gapAfter === 0 ? 'Tied' : gapAfter < 0 ? `${Math.abs(gapAfter)} min ahead` : `${gapAfter} min behind`}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SessionConsequenceCards({
  bossConsequence,
  streakConsequence,
  challengeConsequence,
  rivalConsequence,
}: SessionConsequenceCardsProps): JSX.Element | null {
  const { theme } = useTheme();

  // Build cards array in order of impact
  const cards: JSX.Element[] = [];

  // Priority 1: Boss (highest impact)
  if (bossConsequence) {
    cards.push(
      <BossImpactCard
        key="boss"
        {...bossConsequence}
      />
    );
  }

  // Priority 2: Streak
  if (streakConsequence) {
    cards.push(
      <StreakConsequenceCard
        key="streak"
        {...streakConsequence}
      />
    );
  }

  // Priority 3: Challenge
  if (challengeConsequence) {
    cards.push(
      <ChallengeImpactCard
        key="challenge"
        {...challengeConsequence}
      />
    );
  }

  // Priority 4: Rival
  if (rivalConsequence) {
    cards.push(
      <RivalImpactCard
        key="rival"
        {...rivalConsequence}
      />
    );
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeInRight.duration(400).delay(600)}>
      <View style={{ marginVertical: theme.spacing[4] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[3], paddingHorizontal: theme.spacing[6] }}>
          <Text fontSize={16}>🎯</Text>
          <Text variant="label" color="text.tertiary">
            SESSION IMPACT
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing[6] }}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + theme.spacing[3]}
        >
          {cards}
        </ScrollView>
      </View>
    </Animated.View>
  );
}

export default SessionConsequenceCards;
