import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { styles } from './BossPhaseIndicator.styles';
import { PhaseTips } from './PhaseTips';
import { lightColors } from '@/theme/tokens/colors';

/** BossPhaseIndicator — archived. Boss phases moved to archive/features/boss/ */
type BossPhase = string;
type BossPhaseState = {
  currentPhase: BossPhase | null;
  previousPhase: BossPhase | null;
};

interface BossPhaseIndicatorProps {
  phase: BossPhase;
  phaseState: BossPhaseState;
  bossHealthPercent: number;
  mechanicActive: boolean;
  mechanicTimeRemaining?: number;
}

export const BossPhaseIndicator: React.FC<BossPhaseIndicatorProps> = ({
  phase,
  phaseState: _phaseState,
  bossHealthPercent,
  mechanicActive,
  mechanicTimeRemaining,
}) => {
  const phaseInfo = useMemo(() => {
    switch (phase) {
      case 'PHASE_1':
        return {
          name: 'Phase 1: Standard',
          color: lightColors.semantic.success,
          description: 'Normal conditions',
        };
      case 'PHASE_2':
        return {
          name: 'Phase 2: Enrage',
          color: lightColors.semantic.warning,
          description: 'Increased pressure — pauses affect score',
        };
      case 'PHASE_3':
        return {
          name: 'Phase 3: Execute',
          color: lightColors.semantic.danger,
          description: 'Final phase — maintain 90%+ purity',
        };
      default:
        return {
          name: 'Archived',
          color: lightColors.text.muted,
          description: 'Phase archived',
        };
    }
  }, [phase]);

  const nextThreshold = useMemo(() => {
    if (phase === 'PHASE_1') {return 50;}
    if (phase === 'PHASE_2') {return 25;}
    return 0;
  }, [phase]);

  const healthToNextPhase = bossHealthPercent - nextThreshold;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: phaseInfo.color }]}>
        <Text style={styles.phaseName}>{phaseInfo.name}</Text>
        {phase === 'ENRAGED' && (
          <View style={styles.enragedBadge}>
            <Text style={styles.enragedText}>ENRAGED</Text>
          </View>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.thresholds}>
          <ThresholdMarker
            percent={100}
            label="Start"
            active={bossHealthPercent <= 100}
          />
          <ThresholdMarker
            percent={75}
            label="75%"
            active={bossHealthPercent <= 75}
          />
          <ThresholdMarker
            percent={50}
            label="Phase 2"
            active={bossHealthPercent <= 50}
            isPhase
          />
          <ThresholdMarker
            percent={25}
            label="Phase 3"
            active={bossHealthPercent <= 25}
            isPhase
          />
          <ThresholdMarker
            percent={0}
            label="Complete"
            active={bossHealthPercent <= 0}
          />
        </View>

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
          <Text style={styles.healthPercent}>
            {bossHealthPercent.toFixed(1)}%
          </Text>
        </View>

        {nextThreshold > 0 && (
          <Text style={styles.nextPhaseText}>
            {healthToNextPhase.toFixed(1)}% until next phase
          </Text>
        )}
      </View>

      <View style={styles.descriptionSection}>
        <Text style={styles.description}>{phaseInfo.description}</Text>
      </View>

      {mechanicActive && (
        <View style={styles.mechanicWarning}>
          <Text style={styles.mechanicTitle}>! MECHANIC ACTIVE</Text>
          {mechanicTimeRemaining && (
            <Text style={styles.mechanicTimer}>
              {Math.ceil(mechanicTimeRemaining / 1000)}s remaining
            </Text>
          )}
        </View>
      )}

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

const ThresholdMarker: React.FC<ThresholdMarkerProps> = ({
  percent: _percent,
  label,
  active,
  isPhase,
}) => (
  <View style={styles.thresholdContainer}>
    <View
      style={[
        styles.thresholdDot,
        active && styles.thresholdDotActive,
        isPhase && styles.thresholdDotPhase,
      ]}
    />
    <Text
      style={[styles.thresholdLabel, active && styles.thresholdLabelActive]}
    >
      {label}
    </Text>
  </View>
);
