/**
 * CompanionScreen
 *
 * PHASE 13.1 - Full companion detail screen
 * Hero LivingCompanion, stats, phase progress, element display,
 * session mood history, and evolution preview
 *
 * @phase 13.1
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInUp, withSpring, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { Box, Card, Text } from '../../components/primitives';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store';
import type { CompanionState, CompanionMood, CompanionPhase, CompanionElement } from '../../features/companion/types';
import { EVOLUTION_THRESHOLDS, ELEMENT_THEMES } from '../../features/companion/types';
import { loadCompanionState, loadRecentSessionMoods, getEvolutionProgress } from '../../features/companion/session-storage';
import { LivingCompanion } from '../../features/companion/components/LivingCompanion';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.6;

// Element lore descriptions
const ELEMENT_LORE: Record<CompanionElement, string> = {
  FLAME: 'Born from the spark of determination. Flame companions thrive on intense, energetic focus sessions and grant bonus damage against bosses.',
  WAVE: 'Flowing with the rhythm of consistency. Wave companions excel in sustained, calm focus and protect your streak through turbulent times.',
  TERRA: 'Grounded in steady progress. Terra companions reward patient, methodical focus and provide stability when challenges arise.',
  ZEPHYR: 'Swift and adaptable. Zephyr companions shine in quick, adaptive focus bursts and help you recover faster from distractions.',
  VOID: 'Mysterious and intensive. Void companions draw power from deep, uninterrupted focus states and amplify rare rewards.',
  LUMINA: 'Pure and perfectionist. Lumina companions seek excellence in every session and illuminate the path to mastery.',
};

// Mood colors for history dots
const MOOD_COLORS: Record<CompanionMood, string> = {
  SLEEPY: '#9CA3AF',
  CONTENT: '#22C55E',
  FOCUSED: '#3B82F6',
  DETERMINED: '#F97316',
  ECSTATIC: '#F59E0B',
  STRUGGLING: '#EF4444',
  DANGER: '#DC2626',
};

// Phase display names
const PHASE_NAMES: Record<CompanionPhase, string> = {
  EGG: 'Egg',
  HATCHING: 'Hatching',
  YOUNG: 'Young',
  MATURE: 'Mature',
  AWAKENED: 'Awakened',
  TRANSCENDENT: 'Transcendent',
};

// Phase order for progression
const PHASE_ORDER: CompanionPhase[] = ['EGG', 'HATCHING', 'YOUNG', 'MATURE', 'AWAKENED', 'TRANSCENDENT'];

interface SessionMoodEntry {
  mood: CompanionMood;
  timestamp: number;
  sessionId: string;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
  | { status: 'success'; companion: CompanionState; moodHistory: SessionMoodEntry[] };

export function CompanionScreen(): JSX.Element {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  const load = useCallback(async () => {
    if (!userId) {
      setLoadState({ status: 'empty' });
      return;
    }
    setLoadState({ status: 'loading' });
    try {
      const [companion, moodHistory] = await Promise.all([
        loadCompanionState(userId),
        loadRecentSessionMoods(userId, 5),
      ]);
      setLoadState({ status: 'success', companion, moodHistory });
    } catch (caught: unknown) {
      setLoadState({
        status: 'error',
        error: caught instanceof Error ? caught : new Error(String(caught)),
      });
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loadState.status === 'loading') {
    return <CompanionScreenSkeleton theme={theme} />;
  }

  if (loadState.status === 'empty') {
    return (
      <Box flex={1} bg="background.primary" justifyContent="center" alignItems="center" p="xl">
        <Text variant="h4" color="text.primary">Your companion needs an active profile.</Text>
      </Box>
    );
  }

  if (loadState.status === 'error') {
    return (
      <Box flex={1} bg="background.primary" justifyContent="center" alignItems="center" p="xl" gap="md">
        <Text variant="h4" color="error.DEFAULT">Companion details did not load.</Text>
        <Text variant="body" color="text.secondary">
          VEX kept the session safe. Retry the companion profile.
        </Text>
      </Box>
    );
  }

  const { companion, moodHistory } = loadState;
  const themeColors = ELEMENT_THEMES[companion.element];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO: LivingCompanion at 60% screen height */}
      <Animated.View entering={FadeIn.duration(600)}>
        <Box
          height={HERO_HEIGHT}
          bg="background.secondary"
          justifyContent="center"
          alignItems="center"
          position="relative"
        >
          {/* Background glow based on element */}
          <Box
            position="absolute"
            width="100%"
            height="100%"
            style={{
              backgroundColor: `${themeColors.glow}10`,
            }}
          />

          {/* LivingCompanion - static display with demo session data */}
          <LivingCompanion
            companionState={companion}
            sessionProgress={0}
            purityScore={85}
            elapsedSeconds={0}
            totalSeconds={1800}
            isPaused={false}
          />

          {/* Phase badge */}
          <Box
            position="absolute"
            style={{
              top: theme.spacing[4],
              right: theme.spacing[4],
            }}
            px="md"
            py="sm"
            borderRadius="full"
            bg={`${themeColors.primary}20`}
            borderWidth={1}
            borderColor={themeColors.primary}
          >
            <Text variant="caption" color={themeColors.primary} fontWeight="600">
              {PHASE_NAMES[companion.phase]} Phase
            </Text>
          </Box>
        </Box>
      </Animated.View>

      {/* STATS SECTION */}
      <Animated.View entering={FadeInUp.duration(400).delay(200)}>
        <Box px="lg" py="xl" gap="lg">
          <Text variant="h3" color="text.primary">Companion Stats</Text>

          <Box flexDirection="row" gap="md">
            <StatCard
              label="Focus Minutes"
              value={Math.floor(companion.totalFocusMinutes).toLocaleString()}
              icon="⏱️"
              color={themeColors.primary}
            />
            <StatCard
              label="Sessions Together"
              value={companion.sessionCount.toLocaleString()}
              icon="🔥"
              color={themeColors.primary}
            />
            <StatCard
              label="Perfect Sessions"
              value={companion.perfectSessions.toLocaleString()}
              icon="✨"
              color={themeColors.primary}
            />
          </Box>
        </Box>
      </Animated.View>

      {/* PHASE PROGRESS SECTION */}
      <Animated.View entering={FadeInUp.duration(400).delay(300)}>
        <Box px="lg" pb="xl" gap="md">
          <Text variant="h3" color="text.primary">Evolution Progress</Text>

          <Card size="md" style={{ backgroundColor: theme.colors.background.secondary }}>
            <Box gap="md">
              {/* Phase chain */}
              <PhaseProgressBar currentPhase={companion.phase} totalMinutes={companion.totalFocusMinutes} />

              {/* Current level indicator */}
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text variant="body" color="text.secondary">
                  Current Level
                </Text>
                <Text variant="h4" color={themeColors.primary} fontWeight="700">
                  {companion.level}/100
                </Text>
              </Box>

              {/* Progress to next evolution */}
              {companion.phase !== 'TRANSCENDENT' && (
                <Box>
                  <Box flexDirection="row" justifyContent="space-between" mb="xs">
                    <Text variant="caption" color="text.tertiary">
                      Progress to {PHASE_NAMES[getNextPhase(companion.phase)]}
                    </Text>
                    <Text variant="caption" color={themeColors.primary}>
                      {Math.floor(getEvolutionProgress(companion) * 100)}%
                    </Text>
                  </Box>
                  <Box
                    height={8}
                    borderRadius="full"
                    bg="background.tertiary"
                    overflow="hidden"
                  >
                    <Box
                      height="100%"
                      borderRadius="full"
                      bg={themeColors.primary}
                      style={{
                        width: `${getEvolutionProgress(companion) * 100}%`,
                      }}
                    />
                  </Box>
                </Box>
              )}

              {companion.phase === 'TRANSCENDENT' && (
                <Box
                  p="md"
                  borderRadius="lg"
                  bg={`${themeColors.glow}15`}
                  alignItems="center"
                >
                  <Text variant="body" color={themeColors.primary} fontWeight="600">
                    🌟 Maximum Evolution Reached
                  </Text>
                </Box>
              )}
            </Box>
          </Card>
        </Box>
      </Animated.View>

      {/* ELEMENT AFFINITY SECTION */}
      <Animated.View entering={FadeInUp.duration(400).delay(400)}>
        <Box px="lg" pb="xl" gap="md">
          <Text variant="h3" color="text.primary">Element Affinity</Text>

          <Card
            size="md"
            style={{
              backgroundColor: `${themeColors.primary}08`,
              borderWidth: 1,
              borderColor: `${themeColors.primary}30`,
            }}
          >
            <Box flexDirection="row" gap="md" alignItems="flex-start">
              <Box
                width={56}
                height={56}
                borderRadius="lg"
                bg={`${themeColors.primary}20`}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={28}>{getElementIcon(companion.element)}</Text>
              </Box>

              <Box flex={1} gap="xs">
                <Text variant="h4" color={themeColors.primary} fontWeight="600">
                  {companion.element}
                </Text>
                <Text variant="caption" color="text.tertiary">
                  Affinity: {companion.elementAffinity}%
                </Text>
                <Text variant="bodySmall" color="text.secondary" mt="xs">
                  {ELEMENT_LORE[companion.element]}
                </Text>
              </Box>
            </Box>
          </Card>
        </Box>
      </Animated.View>

      {/* MOOD HISTORY SECTION */}
      <Animated.View entering={FadeInUp.duration(400).delay(500)}>
        <Box px="lg" pb="xl" gap="md">
          <Text variant="h3" color="text.primary">Session History</Text>

          <Card size="md" style={{ backgroundColor: theme.colors.background.secondary }}>
            <Box gap="md">
              <Text variant="bodySmall" color="text.secondary">
                Last {moodHistory.length} session{moodHistory.length !== 1 ? 's' : ''}
              </Text>

              <Box flexDirection="row" gap="sm" alignItems="center">
                {moodHistory.length > 0 ? (
                  moodHistory.map((entry, index) => (
                    <MoodDot
                      key={entry.sessionId}
                      mood={entry.mood}
                      delay={index * 100}
                    />
                  ))
                ) : (
                  <Text variant="caption" color="text.tertiary">
                    No recent sessions recorded
                  </Text>
                )}
              </Box>

              {/* Legend */}
              <Box flexDirection="row" flexWrap="wrap" gap="sm" mt="sm">
                {(['ECSTATIC', 'DETERMINED', 'FOCUSED', 'CONTENT', 'SLEEPY', 'STRUGGLING'] as CompanionMood[]).map(
                  (mood) => (
                    <Box key={mood} flexDirection="row" alignItems="center" gap="xs">
                      <Box
                        width={8}
                        height={8}
                        borderRadius="full"
                        bg={MOOD_COLORS[mood]}
                      />
                      <Text variant="caption" color="text.tertiary">
                        {mood}
                      </Text>
                    </Box>
                  )
                )}
              </Box>
            </Box>
          </Card>
        </Box>
      </Animated.View>

      {/* EVOLUTION PREVIEW SECTION */}
      {companion.phase !== 'TRANSCENDENT' && (
        <Animated.View entering={FadeInUp.duration(400).delay(600)}>
          <Box px="lg" pb="xl" gap="md">
            <Text variant="h3" color="text.primary">Evolution Preview</Text>

            <Card
              size="md"
              style={{
                backgroundColor: theme.colors.background.secondary,
                borderWidth: 1,
                borderColor: `${themeColors.primary}30`,
                borderStyle: 'dashed',
              }}
            >
              <Box flexDirection="row" gap="md" alignItems="center">
                {/* Blurred silhouette preview */}
                <Box
                  width={80}
                  height={80}
                  borderRadius="lg"
                  bg={`${themeColors.primary}15`}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    opacity: 0.6,
                    shadowColor: themeColors.glow,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                  }}
                >
                  <Text fontSize={40} style={{ opacity: 0.4 }}>
                    {getPhaseEmoji(getNextPhase(companion.phase))}
                  </Text>
                </Box>

                <Box flex={1} gap="xs">
                  <Text variant="h4" color={themeColors.primary} fontWeight="600">
                    Next: {PHASE_NAMES[getNextPhase(companion.phase)]}
                  </Text>
                  <Text variant="bodySmall" color="text.secondary">
                    Your companion will transform after accumulating enough focus time.
                    Keep practicing to unlock new forms!
                  </Text>
                </Box>
              </Box>
            </Card>
          </Box>
        </Animated.View>
      )}
    </ScrollView>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}): JSX.Element {
  const { theme } = useTheme();

  return (
    <Card
      size="sm"
      style={{
        backgroundColor: theme.colors.background.secondary,
        flex: 1,
        minWidth: 100,
      }}
    >
      <Box alignItems="center" gap="xs">
        <Text fontSize={24}>{icon}</Text>
        <Text variant="h4" color={color} fontWeight="700" textAlign="center">
          {value}
        </Text>
        <Text variant="caption" color="text.tertiary" textAlign="center">
          {label}
        </Text>
      </Box>
    </Card>
  );
}

// Phase Progress Bar Component
function PhaseProgressBar({
  currentPhase,
  totalMinutes,
}: {
  currentPhase: CompanionPhase;
  totalMinutes: number;
}): JSX.Element {
  const { theme } = useTheme();
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);

  return (
    <Box flexDirection="row" justifyContent="space-between" alignItems="center">
      {PHASE_ORDER.map((phase, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isFuture = index > currentIndex;

        return (
          <Box key={phase} alignItems="center" flex={1}>
            <Box
              width={40}
              height={40}
              borderRadius="full"
              justifyContent="center"
              alignItems="center"
              bg={
                isCompleted
                  ? 'success.DEFAULT'
                  : isActive
                  ? 'primary.500'
                  : 'background.tertiary'
              }
              style={{
                opacity: isFuture ? 0.4 : 1,
                borderWidth: isActive ? 2 : 0,
                borderColor: isActive ? theme.colors.primary[400] : undefined,
              }}
            >
              <Text fontSize={16}>
                {isCompleted ? '✓' : getPhaseEmoji(phase)}
              </Text>
            </Box>
            <Text
              variant="caption"
              color={isActive ? 'primary.500' : isFuture ? 'text.tertiary' : 'text.secondary'}
              mt="xs"
              textAlign="center"
              style={{ fontSize: 10 }}
            >
              {PHASE_NAMES[phase]}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

// Animated Mood Dot Component
function MoodDot({ mood, delay }: { mood: CompanionMood; delay: number }): JSX.Element {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Box
        width={24}
        height={24}
        borderRadius="full"
        bg={MOOD_COLORS[mood]}
        style={{
          shadowColor: MOOD_COLORS[mood],
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
        }}
      />
    </Animated.View>
  );
}

// Skeleton Loading State
function CompanionScreenSkeleton({ theme }: { theme: ReturnType<typeof useTheme>['theme'] }): JSX.Element {
  return (
    <Box flex={1} bg="background.primary">
      <Box height={HERO_HEIGHT} bg="background.secondary" justifyContent="center" alignItems="center">
        <Box width={200} height={200} borderRadius="full" bg={theme.colors.background.tertiary} />
      </Box>
      <Box p="lg" gap="lg">
        <Box height={32} width={200} borderRadius="md" bg={theme.colors.background.tertiary} />
        <Box height={100} borderRadius="lg" bg={theme.colors.background.secondary} />
      </Box>
    </Box>
  );
}

// Helper functions
function getNextPhase(currentPhase: CompanionPhase): CompanionPhase {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  if (currentIndex >= PHASE_ORDER.length - 1) {return currentPhase;}
  return PHASE_ORDER[currentIndex + 1];
}

function getPhaseEmoji(phase: CompanionPhase): string {
  const emojis: Record<CompanionPhase, string> = {
    EGG: '🥚',
    HATCHING: '🐣',
    YOUNG: '🐤',
    MATURE: '🦅',
    AWAKENED: '🐉',
    TRANSCENDENT: '🌟',
  };
  return emojis[phase];
}

function getElementIcon(element: CompanionElement): string {
  const icons: Record<CompanionElement, string> = {
    FLAME: '🔥',
    WAVE: '🌊',
    TERRA: '🌿',
    ZEPHYR: '💨',
    VOID: '🌑',
    LUMINA: '✨',
  };
  return icons[element];
}

export default CompanionScreen;
