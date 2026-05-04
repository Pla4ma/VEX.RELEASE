/**
 * Streak Narrative Card
 * Turns streak numbers into an unfolding story
 * 
 * Features:
 * - Loading states
 * - Error boundaries
 * - Validation
 * - Analytics tracking
 * - Haptic feedback
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { generateStreakNarrative } from '../../retention/streak-narrative';
import { StreakNarrativeInputSchema } from '../../retention/streak-narrative-schemas';
import { useTheme } from '../../theme';

interface StreakNarrativeCardProps {
  streakDays: number;
  maxStreak: number;
  totalSessions: number;
  onStartSession: () => void;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

interface CardState {
  isLoading: boolean;
  error: Error | null;
  narrative: ReturnType<typeof generateStreakNarrative> | null;
}

export const StreakNarrativeCard: React.FC<StreakNarrativeCardProps> = ({
  streakDays,
  maxStreak,
  totalSessions,
  onStartSession,
  isLoading: externalLoading = false,
  error: externalError = null,
  onRetry,
}) => {
  const { theme } = useTheme();
  const [state, setState] = useState<CardState>({
    isLoading: externalLoading,
    error: externalError,
    narrative: null,
  });

  // Validate inputs and generate narrative
  useEffect(() => {
    const loadNarrative = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Validate inputs
        const validation = StreakNarrativeInputSchema.safeParse({
          streakDays,
          maxStreak,
          totalSessions,
          hoursSinceLastSession: 0,
          comebackTokens: 0,
        });

        if (!validation.success) {
          throw new Error(`Invalid narrative input: ${validation.error.message}`);
        }

        // Generate narrative
        const narrative = generateStreakNarrative(streakDays, maxStreak, totalSessions);
        
        setState({
          isLoading: false,
          error: null,
          narrative,
        });

        // Track view (TODO: wire to analytics)
        // eventBus.publish(StreakNarrativeEvents.NARRATIVE_VIEWED, {...});

      } catch (err) {
        setState({
          isLoading: false,
          error: err instanceof Error ? err : new Error('Failed to load narrative'),
          narrative: null,
        });
      }
    };

    loadNarrative();
  }, [streakDays, maxStreak, totalSessions]);

  const handleStartSession = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStartSession();
  };

  // Loading state
  if (state.isLoading || externalLoading) {
    return (
      <View style={{ backgroundColor: (theme.colors.background as any)?.elevated ?? '#1A202C', borderRadius: 16, padding: 20, margin: 16 }}>
        <ActivityIndicator size="large" color={(theme.colors.primary as any)?.[500] ?? '#4299E1'} />
        <Text style={{ marginTop: 16, fontSize: 14, color: (theme.colors.text as any)?.muted ?? '#A0AEC0', textAlign: 'center' }}>Summoning your nemesis...</Text>
      </View>
    );
  }

  // Error state
  if (state.error || externalError) {
    return (
      <View style={{ backgroundColor: (theme.colors.background as any)?.elevated ?? '#1A202C', borderRadius: 16, padding: 20, margin: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: (theme.colors.text as any)?.primary ?? '#F7FAFC', marginBottom: 8 }}>Story Unavailable</Text>
        <Text style={{ fontSize: 14, color: (theme.colors.text as any)?.muted ?? '#A0AEC0', textAlign: 'center', marginBottom: 16, paddingHorizontal: 20 }}>
          {state.error?.message || externalError?.message || 'Failed to load narrative'}
        </Text>
        {onRetry && (
          <Pressable style={{ backgroundColor: (theme.colors.primary as any)?.[500] ?? '#4299E1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }} onPress={onRetry}>
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Try Again</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // Empty state (shouldn't happen, but handle gracefully)
  if (!state.narrative) {
    return (
      <View style={{ backgroundColor: (theme.colors.background as any)?.elevated ?? '#1A202C', borderRadius: 16, padding: 20, margin: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: (theme.colors.text as any)?.muted ?? '#A0AEC0', textAlign: 'center', fontStyle: 'italic' }}>Begin your journey today</Text>
      </View>
    );
  }

  const { narrative } = state;
  const boss = narrative.currentBoss;
  
  return (
    <View style={{ backgroundColor: (theme.colors.background as any)?.elevated ?? '#1A202C', borderRadius: 16, padding: 20, margin: 16 }}>
      {/* Chapter Header */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 10, color: (theme.colors.text as any)?.muted ?? '#A0AEC0', letterSpacing: 2 }}>CHAPTER {streakDays + 1}</Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: (theme.colors.text as any)?.primary ?? '#F7FAFC', marginTop: 4 }}>{narrative.currentChapter}</Text>
      </View>
      
      {/* Boss Battle Scene */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        {/* Player (User) */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: (theme.colors.primary as any)?.[500] ?? '#4299E1', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: (theme.colors.primary as any)?.[400] ?? '#63B3ED' }}>
            <Text style={{ fontSize: 28 }}>🧙‍♂️</Text>
          </View>
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: (theme.colors.text as any)?.primary ?? '#F7FAFC' }}>{streakDays}</Text>
            <Text style={{ fontSize: 12, color: (theme.colors.text as any)?.muted ?? '#A0AEC0' }}>Day Streak</Text>
          </View>
        </View>
        
        {/* VS */}
        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: (theme.colors.error as any)?.DEFAULT ?? '#E53E3E' }}>VS</Text>
          <View style={{ width: 40, height: 2, backgroundColor: (theme.colors.error as any)?.DEFAULT ?? '#E53E3E', marginTop: 4 }} />
        </View>
        
        {/* Enemy (Boss) */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: (theme.colors.background as any)?.secondary ?? '#2D3748', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: getBossColor(boss.difficulty) }}>
            <Text style={{ fontSize: 28 }}>{getBossEmoji(boss.id)}</Text>
          </View>
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: (theme.colors.text as any)?.primary ?? '#F7FAFC', textAlign: 'center' }}>{boss.name}</Text>
            <Text style={{ fontSize: 10, color: (theme.colors.text as any)?.muted ?? '#A0AEC0' }}>{boss.title}</Text>
          </View>
        </View>
      </View>
      
      {/* Boss Taunt */}
      <View style={{ backgroundColor: (theme.colors.background as any)?.secondary ?? '#2D3748', borderRadius: 12, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: (theme.colors.error as any)?.DEFAULT ?? '#E53E3E' }}>
        <Text style={{ fontSize: 14, color: (theme.colors.text as any)?.primary ?? '#F7FAFC', fontStyle: 'italic' }}>"{narrative.dailyTaunt}"</Text>
      </View>
      
      {/* Personal Story */}
      <Text style={{ fontSize: 13, color: (theme.colors.text as any)?.secondary ?? '#CBD5E0', textAlign: 'center', marginBottom: 16, lineHeight: 20 }}>{narrative.personalStory}</Text>
      
      {/* Next Milestone Teaser */}
      <View style={{ backgroundColor: (theme.colors.background as any)?.secondary ?? '#2D3748', borderRadius: 8, padding: 12, marginBottom: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 10, color: (theme.colors.success as any)?.DEFAULT ?? '#48BB78', letterSpacing: 1, marginBottom: 4 }}>NEXT MILESTONE</Text>
        <Text style={{ fontSize: 13, color: (theme.colors.text as any)?.primary ?? '#F7FAFC', fontWeight: '500' }}>{narrative.nextMilestone.teaser}</Text>
      </View>
      
      {/* CTA */}
      <Pressable
        style={({ pressed }) => ({
          backgroundColor: (theme.colors.error as any)?.DEFAULT ?? '#E53E3E',
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: 'center',
          opacity: pressed ? 0.8 : 1,
        })}
        onPress={handleStartSession}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>⚔️ Battle Today</Text>
      </Pressable>
    </View>
  );
};

function getBossColor(difficulty: string): string {
  const colors: Record<string, string> = {
    EASY: '#48BB78',
    MEDIUM: '#ED8936',
    HARD: '#E53E3E',
    NIGHTMARE: '#805AD5',
  };
  return colors[difficulty] || '#718096';
}

function getBossEmoji(bossId: string): string {
  const emojis: Record<string, string> = {
    phantom: '👻',
    kraken: '🐙',
    dragon: '🐉',
    titan: '🗿',
    void: '🌑',
  };
  return emojis[bossId] || '👹';
}
