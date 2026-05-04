/**
 * Streak Creature Widget
 *
 * UI component for displaying the user's streak creature
 * Handles loading, empty, error, and normal states
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { getStreakCreatureSystem } from '../StreakCreatureSystem';
import { getStreakCreatureRepository } from '../StreakCreatureRepository';
import {
  TransformationErrorBoundary,
  TransformationLoadingState,
  TransformationEmptyState,
  TransformationErrorState,
} from '../../integration/ErrorBoundary';

interface Props {
  userId: string;
  userGems: number;
  onReviveRequest?: (cost: number) => void;
  compact?: boolean;
}

export function StreakCreatureWidget({ userId, userGems, onReviveRequest, compact = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type CreatureDisplay = ReturnType<ReturnType<typeof getStreakCreatureSystem>['getCreatureDisplay']>;
  const [creatureState, setCreatureState] = useState<CreatureDisplay | null>(null);
  const [isReviving, setIsReviving] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const system = getStreakCreatureSystem();
  const repository = getStreakCreatureRepository();

  const loadCreature = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from persistence first
      const savedState = await repository.loadCreatureState(userId);
      if (savedState.success && savedState.data) {
        // Update system with loaded state
        system.restoreFromState(savedState.data);
      }

      const display = system.getCreatureDisplay(userId);
      setCreatureState(display);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load creature');
    } finally {
      setLoading(false);
    }
  }, [userId, system, repository]);

  useEffect(() => {
    loadCreature();
  }, [loadCreature]);

  useEffect(() => {
    // Animate creature on state changes
    if (!loading && creatureState?.state) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, creatureState, animation]);

  const handleRevive = async () => {
    if (!creatureState?.state) {
      return;
    }

    setIsReviving(true);
    try {
      const result = system.reviveCreature(userId, userGems);

      if (result.success) {
        onReviveRequest?.(result.cost);
        await loadCreature();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revive failed');
    } finally {
      setIsReviving(false);
    }
  };

  // Save state on unmount
  useEffect(() => {
    return () => {
      if (creatureState?.state) {
        repository.saveCreatureState(creatureState.state).catch(console.warn);
      }
    };
  }, [creatureState, repository]);

  if (loading) {
    return <TransformationLoadingState message="Summoning your creature..." />;
  }

  if (error) {
    return (
      <TransformationErrorState
        error={error}
        onRetry={loadCreature}
      />
    );
  }

  if (!creatureState?.state) {
    return (
      <TransformationEmptyState
        icon="🥚"
        title="No Creature Yet"
        message="Complete your first session to hatch your streak creature!"
      />
    );
  }

  const { state, stage, displayName } = creatureState;

  if (compact) {
    return (
      <TransformationErrorBoundary systemName="Streak Creature">
        <View style={styles.compactContainer}>
          <Animated.View
            style={[
              styles.compactCreature,
              {
                transform: [
                  { scale: animation },
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.compactEmoji, { color: stage.color }]}>
              {stage.emoji}
            </Text>
            {state.isDead && <Text style={styles.deadOverlay}>💀</Text>}
            {state.isSick && <Text style={styles.sickOverlay}>🤒</Text>}
          </Animated.View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName}>{displayName}</Text>
            <Text style={styles.compactStreak}>{state.currentStreak} day streak</Text>
          </View>
        </View>
      </TransformationErrorBoundary>
    );
  }

  return (
    <TransformationErrorBoundary systemName="Streak Creature">
      <View style={styles.container}>
        {/* Creature Display */}
        <Animated.View
          style={[
            styles.creatureContainer,
            {
              transform: [{ scale: animation }],
              opacity: animation,
            },
          ]}
        >
          <View style={[styles.creatureCircle, { backgroundColor: stage.color + '20' }]}>
            <Text style={[styles.creatureEmoji, { color: stage.color }]}>
              {stage.emoji}
            </Text>
            {state.isDead && (
              <View style={styles.deadOverlay}>
                <Text style={styles.deadText}>💀</Text>
              </View>
            )}
            {state.isCrying && (
              <View style={styles.cryingIndicator}>
                <Text style={styles.cryingText}>😢</Text>
              </View>
            )}
            {state.isCelebrating && (
              <View style={styles.celebratingIndicator}>
                <Text style={styles.celebratingText}>✨</Text>
              </View>
            )}
          </View>

          {/* Creature Info */}
          <Text style={styles.creatureName}>{displayName}</Text>
          <Text style={styles.creatureStage}>{stage.name}</Text>
          <Text style={styles.streakText}>{state.currentStreak} day streak</Text>

          {/* Health Bar */}
          <View style={styles.healthBarContainer}>
            <View
              style={[
                styles.healthBar,
                {
                  width: `${state.healthPercent}%`,
                  backgroundColor: state.healthPercent > 50 ? '#10B981' : '#EF4444',
                },
              ]}
            />
          </View>
          <Text style={styles.healthText}>{Math.floor(state.healthPercent)}% Health</Text>
        </Animated.View>

        {/* Risk Warning */}
        {state.isAtRisk && (
          <View style={[styles.warningBanner, { backgroundColor: '#FEF3C7' as const }]}>
            <Text style={styles.warningText}>⚠️ At risk! Complete a session soon!</Text>
          </View>
        )}

        {/* Death State */}
        {state.isDead && (
          <View style={styles.deathContainer}>
            <Text style={styles.deathText}>Your creature has died 😢</Text>
            <Text style={styles.revivalCost}>Revive for {state.revivalCost} gems</Text>
            <TouchableOpacity
              style={[styles.reviveButton, (isReviving || userGems < state.revivalCost) && styles.disabledButton]}
              onPress={handleRevive}
              disabled={isReviving || userGems < state.revivalCost}
            >
              {isReviving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.reviveButtonText}>Revive Creature</Text>
              )}
            </TouchableOpacity>
            {userGems < state.revivalCost && (
              <Text style={styles.insufficientGems}>
                Need {state.revivalCost - userGems} more gems
              </Text>
            )}
          </View>
        )}

        {/* Evolution Progress */}
        {!state.isDead && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>
              {state.daysInCurrentStage} / {stage.maxDays - stage.minDays} days to next stage
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(state.daysInCurrentStage / (stage.maxDays - stage.minDays)) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </TransformationErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  creatureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  creatureCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  creatureEmoji: {
    fontSize: 64,
  },
  creatureName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  creatureStage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  healthBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  healthBar: {
    height: '100%',
    borderRadius: 4,
  },
  healthText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  deadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deadText: {
    fontSize: 48,
    opacity: 0.8,
  },
  cryingIndicator: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  cryingText: {
    fontSize: 32,
  },
  celebratingIndicator: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  celebratingText: {
    fontSize: 32,
  },
  warningBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    color: '#92400E',
    fontWeight: '600',
    textAlign: 'center',
  },
  deathContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deathText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  revivalCost: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  reviveButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  reviveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  insufficientGems: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactCreature: {
    position: 'relative',
    marginRight: 12,
  },
  compactEmoji: {
    fontSize: 40,
  },
  sickOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 16,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  compactStreak: {
    fontSize: 12,
    color: '#6B7280',
  },
});
