/**
 * Real-time Boss Combat Visual Component
 *
 * Displays the boss battle as it unfolds in real-time during the session.
 * Shows health bar depletion, damage numbers, combo counters, and
 * boss reactions to player focus.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  interpolate,
  Easing,
  runOnJS,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '../../../components/primitives/Text';
import { RealTimeBossEncounter, CombatEvent, BossCombatState, AttackType, getAttackVisuals } from '../types';
import { RealTimeBossService } from '../service';
import { createSheet } from '@/shared/ui/create-sheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOSS_SIZE = Math.min(SCREEN_WIDTH * 0.5, 200);

interface RealTimeBossCombatProps {
  encounter: RealTimeBossEncounter;
  elapsedSeconds: number;
  purityScore: number;
  isPaused: boolean;
  onVictory?: () => void;
}

interface DamageNumber {
  id: string;
  damage: number;
  type: AttackType;
  x: number;
  y: number;
}

export const RealTimeBossCombat: React.FC<RealTimeBossCombatProps> = ({
  encounter,
  elapsedSeconds,
  purityScore,
  isPaused,
  onVictory,
}) => {
  const serviceRef = useRef<RealTimeBossService | null>(null);
  const [currentEncounter, setCurrentEncounter] = useState<RealTimeBossEncounter>(encounter);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [lastMessage, setLastMessage] = useState<string>('');
  const [comboDisplay, setComboDisplay] = useState(0);

  // Animated values
  const healthPercent = useSharedValue(100);
  const bossScale = useSharedValue(1);
  const bossShake = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const rageGlow = useSharedValue(0);
  const victoryScale = useSharedValue(0);

  // Initialize service
  useEffect(() => {
    serviceRef.current = new RealTimeBossService(encounter);

    const unsubscribe = serviceRef.current.onEvent((event) => {
      if (event.type === 'ATTACK_LANDED' && event.data.damage) {
        // Add damage number
        const damageId = `dmg_${Date.now()}_${Math.random()}`;
        const newDamage: DamageNumber = {
          id: damageId,
          damage: event.data.damage,
          type: event.data.attackType || 'NORMAL_FOCUS',
          x: BOSS_SIZE / 2 + (Math.random() - 0.5) * 60,
          y: BOSS_SIZE / 2 - 30 - Math.random() * 40,
        };

        setDamageNumbers(prev => [...prev, newDamage]);
        setTimeout(() => {
          setDamageNumbers(prev => prev.filter(d => d.id !== damageId));
        }, 1500);

        // Trigger boss shake
        const visuals = getAttackVisuals(event.data.attackType || 'NORMAL_FOCUS');
        bossShake.value = withSequence(
          withTiming(visuals.shakeIntensity * 10, { duration: 50 }),
          withTiming(-visuals.shakeIntensity * 10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );

        // Flash effect
        flashOpacity.value = withSequence(
          withTiming(0.8, { duration: 50 }),
          withTiming(0, { duration: 200 })
        );
      }

      if (event.type === 'COMBO_BONUS') {
        setComboDisplay(event.data.comboCount || 0);
        setTimeout(() => setComboDisplay(0), 2000);
      }

      if (event.type === 'PHASE_CHANGE' && event.data.message) {
        setLastMessage(event.data.message);
        if (event.data.message.includes('ENRAGED')) {
          rageGlow.value = withTiming(1, { duration: 500 });
        }
      }

      if (event.type === 'NEAR_DEATH') {
        setLastMessage(event.data.message || '');
        bossScale.value = withSpring(0.9, { damping: 10 });
      }

      if (event.type === 'VICTORY') {
        setLastMessage(event.data.message || '');
        victoryScale.value = withSpring(1, { damping: 15 });
        onVictory?.();
      }
    });

    return () => unsubscribe();
  }, []);

  // Process combat ticks
  useEffect(() => {
    if (serviceRef.current && !isPaused) {
      const result = serviceRef.current.tick(
        elapsedSeconds,
        encounter.sessionDuration,
        purityScore,
        isPaused
      );

      if (result.damageDealt > 0 || result.stateChanged) {
        const updated = serviceRef.current.getEncounter();
        if (updated) {
          setCurrentEncounter(updated);
          healthPercent.value = withSpring(
            (updated.currentHealth / updated.maxHealth) * 100,
            { damping: 20 }
          );
        }
      }
    }
  }, [elapsedSeconds, purityScore, isPaused]);

  // Animated styles
  const bossStyle = useAnimatedStyle(() => {
    const shake = bossShake.value;
    const scale = interpolate(
      healthPercent.value,
      [0, 50, 100],
      [0.85, 0.95, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: shake },
        { scale: bossScale.value * scale },
      ],
    };
  });

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const rageStyle = useAnimatedStyle(() => ({
    opacity: rageGlow.value * 0.6,
  }));

  const victoryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: victoryScale.value }],
    opacity: victoryScale.value,
  }));

  // Health bar color based on state
  const getHealthColor = (): readonly [string, string] => {
    const hp = currentEncounter.currentHealth / currentEncounter.maxHealth;
    if (hp <= 0.1) {return ['#FF0000', '#8B0000'] as const;}
    if (hp <= 0.25) {return ['#FF6B35', '#FF4500'] as const;}
    if (hp <= 0.5) {return ['#FFD700', '#FFA500'] as const;}
    return ['#00CED1', '#20B2AA'] as const;
  };

  return (
    <View style={styles.container}>
      {/* Combat header */}
      <View style={styles.header}>
        <Text variant="h3" style={styles.bossName}>
          {currentEncounter.bossName}
        </Text>
        {currentEncounter.combatState === 'BOSS_RAGE' && (
          <Text style={styles.rageBadge}>ENRAGED</Text>
        )}
      </View>

      {/* Message display */}
      {lastMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{lastMessage}</Text>
        </View>
      )}

      {/* Boss area */}
      <View style={styles.bossArea}>
        {/* Rage glow */}
        {currentEncounter.combatState === 'BOSS_RAGE' && (
          <Animated.View style={[styles.rageGlow, rageStyle]} />
        )}

        {/* Flash overlay */}
        <Animated.View style={[styles.flashOverlay, flashStyle]} />

        {/* Boss avatar */}
        <Animated.View style={[styles.bossContainer, bossStyle]}>
          <View style={[styles.bossAvatar, {
            backgroundColor: currentEncounter.combatState === 'NEAR_DEATH'
              ? '#FF0000'
              : currentEncounter.combatState === 'BOSS_RAGE'
                ? '#FF6B35'
                : '#4A5568',
          }]}>
            <Text style={styles.bossEmoji}>👹</Text>
          </View>
        </Animated.View>

        {/* Damage numbers */}
        {damageNumbers.map((dmg) => (
          <DamageNumberDisplay
            key={dmg.id}
            damage={dmg}
            bossSize={BOSS_SIZE}
          />
        ))}

        {/* Victory overlay */}
        <Animated.View style={[styles.victoryOverlay, victoryStyle]}>
          <Text style={styles.victoryText}>VICTORY!</Text>
        </Animated.View>
      </View>

      {/* Combo display */}
      {comboDisplay > 0 && (
        <View style={styles.comboContainer}>
          <Text style={styles.comboText}>{comboDisplay}x COMBO!</Text>
        </View>
      )}

      {/* Health bar */}
      <View style={styles.healthBarContainer}>
        <View style={styles.healthBarBackground}>
          <Animated.View style={[styles.healthBarFill, {
            width: `${(currentEncounter.currentHealth / currentEncounter.maxHealth) * 100}%`,
          }]}>
            <LinearGradient
              colors={getHealthColor()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <Text style={styles.healthText}>
          {Math.floor(currentEncounter.currentHealth)} / {currentEncounter.maxHealth} HP
        </Text>
      </View>

      {/* Combat stats */}
      <View style={styles.statsRow}>
        <StatBox
          label="DAMAGE"
          value={currentEncounter.damageDealtThisSession}
          color="#FF6B35"
        />
        <StatBox
          label="HITS"
          value={currentEncounter.attacksLanded}
          color="#00CED1"
        />
        <StatBox
          label="CRITICALS"
          value={currentEncounter.criticalHits}
          color="#FFD700"
        />
        <StatBox
          label="COMBO"
          value={currentEncounter.longestCombo}
          color="#FF1493"
        />
      </View>
    </View>
  );
};

/**
 * Individual damage number animation
 */
const DamageNumberDisplay: React.FC<{ damage: DamageNumber; bossSize: number }> = ({
  damage,
  bossSize,
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    translateY.value = withTiming(-80, { duration: 1000, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(0, { duration: 1000, easing: Easing.in(Easing.quad) });
    scale.value = withSpring(1.2, { damping: 10 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const visuals = getAttackVisuals(damage.type);

  return (
    <Animated.View
      style={[
        styles.damageNumber,
        style,
        {
          left: damage.x,
          top: damage.y,
        },
      ]}
    >
      <Text style={[styles.damageText, {
        color: visuals.color,
        fontSize: 16 + visuals.size * 4,
      }]}>
        {damage.type === 'NORMAL_FOCUS' ? '' : '! '}{damage.damage}
      </Text>
    </Animated.View>
  );
};

const StatBox: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = createSheet({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bossName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  rageBadge: {
    backgroundColor: '#FF0000',
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  messageText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bossArea: {
    width: BOSS_SIZE,
    height: BOSS_SIZE,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  rageGlow: {
    position: 'absolute',
    width: BOSS_SIZE * 1.5,
    height: BOSS_SIZE * 1.5,
    borderRadius: BOSS_SIZE * 0.75,
    backgroundColor: '#FF0000',
    opacity: 0.5,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
    opacity: 0,
    zIndex: 20,
  },
  bossContainer: {
    zIndex: 10,
  },
  bossAvatar: {
    width: BOSS_SIZE * 0.8,
    height: BOSS_SIZE * 0.8,
    borderRadius: BOSS_SIZE * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  bossEmoji: {
    fontSize: BOSS_SIZE * 0.4,
  },
  damageNumber: {
    position: 'absolute',
    zIndex: 30,
  },
  damageText: {
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  victoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    borderRadius: 16,
  },
  victoryText: {
    color: '#FFD700',
    fontSize: 32,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  comboContainer: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    backgroundColor: '#FF1493',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  comboText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  healthBarContainer: {
    marginTop: 20,
  },
  healthBarBackground: {
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  healthText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.6,
    marginTop: 4,
    letterSpacing: 1,
  },
});
