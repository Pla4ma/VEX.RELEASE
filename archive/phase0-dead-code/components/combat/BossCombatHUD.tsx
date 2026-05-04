/**
 * Boss Combat HUD
 * 
 * Heads-up display for active combat during focus sessions.
 * Shows boss health, user energy, ability buttons, and combat state.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../theme';
import { Box, Button } from '../../components/primitives';
import { Icon } from '../../icons';
import type { SessionV2State, CombatAbility, UserResources } from '../../session-v2/types';

const { width: screenWidth } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

interface BossCombatHUDProps {
  session: SessionV2State;
  onAbilityUse: (abilityId: string) => void;
  onDodgeAttempt: () => void;
  onSkipPhase?: () => void;
  onExtendPhase?: () => void;
}

interface AbilityButtonProps {
  ability: CombatAbility;
  cooldown: number;
  canUse: boolean;
  energy: number;
  maxEnergy: number;
  onPress: (abilityId: string) => void;
}

// ============================================================================
// Ability Button Component
// ============================================================================

const AbilityButton: React.FC<AbilityButtonProps> = ({
  ability,
  cooldown,
  canUse,
  energy,
  maxEnergy,
  onPress,
}) => {
  const { theme } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (canUse) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        useNativeDriver: true,
        tension: 100,
      }).start();
    }
  }, [canUse, scaleAnim]);

  const handlePress = useCallback(() => {
    if (canUse) {
      onPress(ability.id);
      // Haptic feedback would go here
    }
  }, [canUse, onPress, ability.id]);

  const hasEnoughEnergy = energy >= ability.focusEnergyCost;
  const energyPercent = (energy / maxEnergy) * 100;
  const energyColor = energyPercent > 50 ? theme.colors.success.DEFAULT :
                     energyPercent > 25 ? theme.colors.warning.DEFAULT :
                     theme.colors.error.DEFAULT;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!canUse || !hasEnoughEnergy}
      style={{
        flex: 1,
        marginHorizontal: 4,
        opacity: canUse && hasEnoughEnergy ? 1 : 0.5,
      }}
      accessibilityLabel={`${ability.name} ability`}
      accessibilityHint={`Costs ${ability.focusEnergyCost} energy${cooldown > 0 ? `, ${cooldown}s cooldown` : ''}`}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          backgroundColor: canUse && hasEnoughEnergy ? theme.colors.primary[500] : theme.colors.gray[400],
          borderRadius: 12,
          padding: 12,
          alignItems: 'center',
          minHeight: 80,
          justifyContent: 'center',
        }}
      >
        <Icon
          name={ability.icon}
          size={24}
          color="white"
          style={{ marginBottom: 4 }}
        />
        
        <Text
          style={{
            color: 'white',
            fontSize: 10,
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          {ability.name}
        </Text>
        
        <Text
          style={{
            color: 'white',
            fontSize: 8,
            opacity: 0.8,
          }}
        >
          {ability.focusEnergyCost}⚡
        </Text>
        
        {cooldown > 0 && (
          <Text
            style={{
              color: 'white',
              fontSize: 8,
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: 'rgba(0,0,0,0.5)',
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            {cooldown}s
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================================================
// Boss Combat HUD
// ============================================================================

export const BossCombatHUD: React.FC<BossCombatHUDProps> = ({
  session,
  onAbilityUse,
  onDodgeAttempt,
  onSkipPhase,
  onExtendPhase,
}) => {
  const { theme } = useTheme();
  const [bossHealthAnim] = useState(new Animated.Value(0));
  const [energyAnim] = useState(new Animated.Value(0));
  const [comboAnim] = useState(new Animated.Value(1));

  // Animate values when they change
  useEffect(() => {
    if (session.currentEncounter) {
      const healthPercent = session.currentEncounter.percentHealthRemaining / 100;
      Animated.timing(bossHealthAnim, {
        toValue: healthPercent,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [session.currentEncounter?.percentHealthRemaining, bossHealthAnim]);

  useEffect(() => {
    const energyPercent = session.userResources.focusEnergy / session.userResources.maxFocusEnergy;
    Animated.timing(energyAnim, {
      toValue: energyPercent,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [session.userResources.focusEnergy, session.userResources.maxFocusEnergy, energyAnim]);

  useEffect(() => {
    if (session.comboCount > 1) {
      Animated.sequence([
        Animated.timing(comboAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(comboAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [session.comboCount, comboAnim]);

  const renderBossHealth = () => {
    if (!session.currentEncounter) return null;

    const healthPercent = session.currentEncounter.percentHealthRemaining;
    const healthColor = healthPercent > 50 ? theme.colors.success.DEFAULT :
                       healthPercent > 25 ? theme.colors.warning.DEFAULT :
                       theme.colors.error.DEFAULT;

    return (
      <View style={{ marginBottom: 16 }}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>
            {session.currentEncounter.bossName}
          </Text>
          <Text style={{ color: theme.colors.text.secondary, fontSize: 12 }}>
            {Math.round(healthPercent)}%
          </Text>
        </Box>
        
        <View
          style={{
            height: 8,
            backgroundColor: theme.colors.gray[700],
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={{
              height: '100%',
              backgroundColor: healthColor,
              borderRadius: 4,
              width: bossHealthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>
        
        <Box flexDirection="row" justifyContent="space-between" mt={1}>
          <Text style={{ color: theme.colors.text.secondary, fontSize: 10 }}>
            HP: {session.currentEncounter.bossCurrentHealth}/{session.currentEncounter.bossMaxHealth}
          </Text>
          <Text style={{ color: theme.colors.text.secondary, fontSize: 10 }}>
            Phase: {session.currentEncounter.currentPhase}
          </Text>
        </Box>
      </View>
    );
  };

  const renderUserEnergy = () => {
    const { focusEnergy, maxFocusEnergy } = session.userResources;
    const energyPercent = (focusEnergy / maxFocusEnergy) * 100;
    const energyColor = energyPercent > 50 ? theme.colors.success.DEFAULT :
                       energyPercent > 25 ? theme.colors.warning.DEFAULT :
                       theme.colors.error.DEFAULT;

    return (
      <View style={{ marginBottom: 16 }}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>
            Focus Energy
          </Text>
          <Text style={{ color: theme.colors.text.secondary, fontSize: 12 }}>
            {Math.round(energyPercent)}%
          </Text>
        </Box>
        
        <View
          style={{
            height: 6,
            backgroundColor: theme.colors.gray[700],
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={{
              height: '100%',
              backgroundColor: energyColor,
              borderRadius: 3,
              width: energyAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>
        
        <Text style={{ color: theme.colors.text.secondary, fontSize: 10, marginTop: 2 }}>
          {focusEnergy}/{maxFocusEnergy} ⚡
        </Text>
      </View>
    );
  };

  const renderCombatState = () => {
    const combatPhaseColors: Record<string, string> = {
      'COMBAT_ACTIVE': theme.colors.primary[500],
      'BOSS_RAGE': theme.colors.error.DEFAULT,
      'NEAR_DEATH': theme.colors.error.DEFAULT,
      'VICTORY': theme.colors.success.DEFAULT,
      'DEFEAT': theme.colors.gray[500],
    };

    const phaseColor = combatPhaseColors[session.combatState.phase] || theme.colors.gray[500];

    return (
      <View style={{ marginBottom: 16 }}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>
            Combat State
          </Text>
          <Text style={{ color: phaseColor, fontSize: 12, fontWeight: '600' }}>
            {session.combatState.phase.replace('_', ' ')}
          </Text>
        </Box>
        
        {session.combatState.currentAttack && (
          <View style={{ marginTop: 4 }}>
            <Text style={{ color: theme.colors.warning.DEFAULT, fontSize: 11 }}>
              ⚠️ {session.combatState.currentAttack.replace('_', ' ')}
            </Text>
            <Text style={{ color: theme.colors.text.secondary, fontSize: 10 }}>
              Dodge available!
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderComboCounter = () => {
    if (session.comboCount <= 1) return null;

    return (
      <Animated.View
        style={{
          transform: [{ scale: comboAnim }],
          backgroundColor: theme.colors.warning.DEFAULT,
          borderRadius: 8,
          padding: 8,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
          {session.comboCount}x COMBO!
        </Text>
        <Text style={{ color: 'white', fontSize: 10, opacity: 0.9 }}>
          {session.comboMultiplier.toFixed(1)}x damage
        </Text>
      </Animated.View>
    );
  };

  const renderAbilities = () => {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.colors.text.primary, fontWeight: '600', marginBottom: 8 }}>
          Abilities
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {session.activeAbilities.map((ability) => (
            <AbilityButton
              key={ability.id}
              ability={ability}
              cooldown={session.abilityCooldowns[ability.id] || 0}
              canUse={true} // Would check actual conditions
              energy={session.userResources.focusEnergy}
              maxEnergy={session.userResources.maxFocusEnergy}
              onPress={onAbilityUse}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderDodgeButton = () => {
    if (!session.combatState.currentAttack) return null;

    return (
      <TouchableOpacity
        onPress={onDodgeAttempt}
        style={{
          backgroundColor: theme.colors.error.DEFAULT,
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginBottom: 16,
        }}
        accessibilityLabel="Dodge attack"
        accessibilityHint="Tap to dodge the current boss attack"
      >
        <Icon name="shield" size={24} color="white" style={{ marginBottom: 4 }} />
        <Text style={{ color: 'white', fontWeight: '600' }}>DODGE!</Text>
      </TouchableOpacity>
    );
  };

  const renderPhaseControls = () => {
    return (
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {onSkipPhase && (
          <Button
            variant="secondary"
            size="sm"
            onPress={onSkipPhase}
            style={{ flex: 1 }}
          >
            Skip
          </Button>
        )}
        {onExtendPhase && (
          <Button
            variant="secondary"
            size="sm"
            onPress={onExtendPhase}
            style={{ flex: 1 }}
          >
            +30s
          </Button>
        )}
      </View>
    );
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        paddingTop: 20,
        maxHeight: screenHeight * 0.4,
      }}
    >
      {renderBossHealth()}
      {renderUserEnergy()}
      {renderCombatState()}
      {renderComboCounter()}
      {renderDodgeButton()}
      {renderAbilities()}
      {renderPhaseControls()}
    </View>
  );
};
