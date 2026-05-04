/**
 * Boss Phase Indicator
 * Shows current boss phase, health thresholds, and phase mechanics
 */

import React, { useMemo } from 'react';
import { View, Text, Animated } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import type { BossPhase, BossPhaseState } from '../../features/boss/boss-phases';

interface BossPhaseIndicatorProps {
  phase: BossPhase;
  phaseState: BossPhaseState;
  bossHealthPercent: number;
  mechanicActive: boolean;
  mechanicTimeRemaining?: number;
}

export const BossPhaseIndicator: React.FC<BossPhaseIndicatorProps> = ({
  phase,
  phaseState,
  bossHealthPercent,
  mechanicActive,
  mechanicTimeRemaining,
}) => {
  const phaseInfo = useMemo(() => {
    switch (phase) {
      case 'PHASE_1':
        return {
          name: 'Phase 1: Standard',
          color: '#38A169',
          description: 'Normal combat conditions',
        };
      case 'PHASE_2':
        return {
          name: 'Phase 2: Enrage',
          color: '#D69E2E',
          description: 'Increased pressure - pauses deal damage!',
        };
      case 'PHASE_3':
        return {
          name: 'Phase 3: Execute',
          color: '#E53E3E',
          description: 'FINAL PUSH! Maintain 90%+ purity or fail!',
        };
      default:
        return {
          name: 'Unknown Phase',
          color: '#718096',
          description: '',
        };
    }
  }, [phase]);

  const nextThreshold = useMemo(() => {
    if (phase === 'PHASE_1') {
      return 50;
    }
    if (phase === 'PHASE_2') {
      return 25;
    }
    return 0;
  }, [phase]);

  const healthToNextPhase = bossHealthPercent - nextThreshold;

  return (
    <View style={styles.container}>
      {/* Phase Header */}
      <View style={[styles.header, { backgroundColor: phaseInfo.color }]}>
        <Text style={styles.phaseName}>{phaseInfo.name}</Text>
        {phase === 'ENRAGED' && (
          <View style={styles.enragedBadge}>
            <Text style={styles.enragedText}>ENRAGED!</Text>
          </View>
        )}
      </View>

      {/* Phase Progress */}
      <View style={styles.progressSection}>
        <View style={styles.thresholds}>
          <ThresholdMarker percent={100} label="Start" active={bossHealthPercent <= 100} />
          <ThresholdMarker percent={75} label="75%" active={bossHealthPercent <= 75} />
          <ThresholdMarker percent={50} label="Phase 2" active={bossHealthPercent <= 50} isPhase />
          <ThresholdMarker percent={25} label="Phase 3" active={bossHealthPercent <= 25} isPhase />
          <ThresholdMarker percent={0} label="Defeat" active={bossHealthPercent <= 0} />
        </View>

        {/* Health Bar */}
        <View style={styles.healthBarContainer}>
          <View style={styles.healthBarBackground}>
            <Animated.View
              style={[
                styles.healthBar,
                {
                  width: `${bossHealthPercent}%`,
                  backgroundColor: phaseInfo.color,
                },
              ]}
            />
          </View>
          <Text style={styles.healthPercent}>{bossHealthPercent.toFixed(1)}%</Text>
        </View>

        {nextThreshold > 0 && (
          <Text style={styles.nextPhaseText}>
            {healthToNextPhase.toFixed(1)}% until next phase
          </Text>
        )}
      </View>

      {/* Phase Description */}
      <View style={styles.descriptionSection}>
        <Text style={styles.description}>{phaseInfo.description}</Text>
      </View>

      {/* Active Mechanic Warning */}
      {mechanicActive && (
        <View style={styles.mechanicWarning}>
          <Text style={styles.mechanicTitle}>⚠️ MECHANIC ACTIVE</Text>
          {mechanicTimeRemaining && (
            <Text style={styles.mechanicTimer}>
              {Math.ceil(mechanicTimeRemaining / 1000)}s remaining
            </Text>
          )}
        </View>
      )}

      {/* Phase-specific Tips */}
      <View style={styles.tipsSection}>
        <PhaseTips phase={phase} />
      </View>
    </View>
  );
};

interface ThresholdMarkerProps {
  percent: number;
  label: string;
  active: boolean;
  isPhase?: boolean;
}

const ThresholdMarker: React.FC<ThresholdMarkerProps> = ({ percent: _percent, label, active, isPhase }) => {
  return (
    <View style={styles.thresholdContainer}>
      <View
        style={[
          styles.thresholdDot,
          active && styles.thresholdDotActive,
          isPhase && styles.thresholdDotPhase,
        ]}
      />
      <Text style={[styles.thresholdLabel, active && styles.thresholdLabelActive]}>
        {label}
      </Text>
    </View>
  );
};

const PhaseTips: React.FC<{ phase: BossPhase }> = ({ phase }) => {
  const tips: Record<string, string[]> = {
    PHASE_1: [
      'Focus on maintaining high purity',
      'Save your pause time for emergencies',
      'Build momentum for later phases',
    ],
    PHASE_2: [
      '⚠️ Pauses now deal damage to YOU!',
      'Commit to uninterrupted focus',
      'Use Deep Work mode if available',
    ],
    PHASE_3: [
      '🚨 EXECUTE PHASE!',
      'Maintain 90%+ purity or FAIL!',
      '2-minute countdown - finish strong!',
      'Your streak is on the line!',
    ],
    ENRAGED: [
      '⚠️ BOSS IS ENRAGED!',
      'Damage output increased!',
      'Focus now or fail!',
    ],
    EXECUTE: [
      '🚨 EXECUTE WINDOW!',
      'FINAL PUSH REQUIRED!',
      'All or nothing!',
    ],
  };

  const phaseTips = tips[phase] || tips['PHASE_1'];

  return (
    <View>
      <Text style={styles.tipsHeader}>Phase Tips:</Text>
      {phaseTips.map((tip: string, index: number) => (
        <Text key={index} style={styles.tip}>
          • {tip}
        </Text>
      ))}
    </View>
  );
};

const styles = createSheet({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  enragedBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  enragedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thresholds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  thresholdContainer: {
    alignItems: 'center',
  },
  thresholdDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  thresholdDotActive: {
    backgroundColor: '#4A5568',
  },
  thresholdDotPhase: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4A5568',
  },
  thresholdLabel: {
    fontSize: 10,
    color: '#A0AEC0',
    marginTop: 4,
  },
  thresholdLabelActive: {
    color: '#4A5568',
    fontWeight: '600',
  },
  healthBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  healthBar: {
    height: '100%',
    borderRadius: 6,
  },
  healthPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
    minWidth: 45,
  },
  nextPhaseText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 8,
    fontStyle: 'italic',
  },
  descriptionSection: {
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  description: {
    fontSize: 14,
    color: '#4A5568',
    fontStyle: 'italic',
  },
  mechanicWarning: {
    backgroundColor: '#FED7D7',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mechanicTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C53030',
  },
  mechanicTimer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C53030',
  },
  tipsSection: {
    padding: 16,
  },
  tipsHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 8,
  },
  tip: {
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 4,
  },
});
