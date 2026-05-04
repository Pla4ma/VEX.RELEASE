/**
 * Boss Combat HUD
 * 
 * Main combat interface for real-time boss battles.
 * Displays boss health, user energy, abilities, and combat state.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Box, Button } from '../../components/primitives';
import { Icon } from '../../icons';
import { triggerHapticEvent, HapticEvents } from '../../constants/haptics';
import { eventBus } from '../../events';
import type { SessionV2State, CombatAbility } from '../types';

// ============================================================================
// Types
// ============================================================================

interface BossCombatHUDProps {
  session: SessionV2State;
  onAbilityUse: (abilityId: string) => void;
  onDodgeAttempt: () => void;
  onSkipPhase?: () => void;
  onExtendPhase?: () => void;
  reducedMotion?: boolean;
}

interface CombatAnimationState {
  bossHealthAnimation: Animated.Value;
  energyAnimation: Animated.Value;
  comboAnimation: Animated.Value;
  damageFlashAnimation: Animated.Value;
}

// ============================================================================
// Boss Combat HUD Component
// ============================================================================

export const BossCombatHUD: React.FC<BossCombatHUDProps> = ({
  session,
  onAbilityUse,
  onDodgeAttempt,
  onSkipPhase,
  onExtendPhase,
  reducedMotion = false,
}) => {
  const { theme } = useTheme();
  
  // Animation state
  const [animations] = useState<CombatAnimationState>(() => ({
    bossHealthAnimation: new Animated.Value(0),
    energyAnimation: new Animated.Value(0),
    comboAnimation: new Animated.Value(1),
    damageFlashAnimation: new Animated.Value(0),
  }));

  // UI state
  const [showDamageFlash, setShowDamageFlash] = useState(false);
  const [lastUsedAbility, setLastUsedAbility] = useState<string | null>(null);

  // Refs
  const abilityRefs = useRef<(TouchableOpacity | null)[]>([]);
  const dodgeButtonRef = useRef<TouchableOpacity>(null);

  // ============================================================================
  // Animations
  // ============================================================================

  useEffect(() => {
    if (session.currentEncounter) {
      const healthPercent = session.currentEncounter.percentHealthRemaining / 100;
      const animationConfig = reducedMotion 
        ? { duration: 0, useNativeDriver: false }
        : { duration: 300, useNativeDriver: false };
      
      Animated.timing(animations.bossHealthAnimation, {
        toValue: healthPercent,
        ...animationConfig,
      }).start();
    }
  }, [session.currentEncounter?.percentHealthRemaining, animations.bossHealthAnimation, reducedMotion]);

  useEffect(() => {
    const energyPercent = session.userResources.focusEnergy / session.userResources.maxFocusEnergy;
    const animationConfig = reducedMotion 
      ? { duration: 0, useNativeDriver: false }
      : { duration: 300, useNativeDriver: false };
    
    Animated.timing(animations.energyAnimation, {
      toValue: energyPercent,
      ...animationConfig,
    }).start();
  }, [session.userResources.focusEnergy, session.userResources.maxFocusEnergy, animations.energyAnimation, reducedMotion]);

  useEffect(() => {
    if (session.comboCount > 1 && !reducedMotion) {
      Animated.sequence([
        Animated.timing(animations.comboAnimation, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animations.comboAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      triggerHapticEvent(HapticEvents.SUCCESS);
    }
  }, [session.comboCount, animations.comboAnimation, reducedMotion]);

  useEffect(() => {
    if (showDamageFlash && !reducedMotion) {
      Animated.sequence([
        Animated.timing(animations.damageFlashAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animations.damageFlashAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowDamageFlash(false);
      });
    }
  }, [showDamageFlash, animations.damageFlashAnimation, reducedMotion]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleAbilityUse = useCallback((abilityId: string) => {
    const ability = session.activeAbilities.find(a => a.id === abilityId);
    if (!ability) return;

    const cooldown = session.abilityCooldowns[abilityId] || 0;
    const hasEnergy = session.userResources.focusEnergy >= ability.focusEnergyCost;

    if (cooldown === 0 && hasEnergy) {
      onAbilityUse(abilityId);
      setLastUsedAbility(abilityId);
      triggerHapticEvent(HapticEvents.IMPACT_LIGHT);
      
      eventBus.publish('analytics:track', {
        event: 'combat_ability_used',
        properties: {
          abilityId,
          abilityName: ability.name,
          abilityType: ability.type,
          damage: ability.baseDamage,
          energyCost: ability.focusEnergyCost,
          comboCount: session.comboCount,
        },
      });
    } else {
      triggerHapticEvent(HapticEvents.ERROR);
    }
  }, [session.activeAbilities, session.abilityCooldowns, session.userResources.focusEnergy, session.comboCount, onAbilityUse]);

  const handleDodgeAttempt = useCallback(() => {
    if (session.combatState.currentAttack) {
      onDodgeAttempt();
      triggerHapticEvent(HapticEvents.IMPACT_MEDIUM);
      
      eventBus.publish('analytics:track', {
        event: 'combat_dodge_attempted',
        properties: {
          attackType: session.combatState.currentAttack,
          dodgeSuccessRate: session.dodgeAttempts > 0 ? (session.successfulDodges / session.dodgeAttempts) * 100 : 0,
          comboCount: session.comboCount,
        },
      });
    } else {
      triggerHapticEvent(HapticEvents.ERROR);
    }
  }, [session.combatState.currentAttack, session.dodgeAttempts, session.successfulDodges, session.comboCount, onDodgeAttempt]);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const canUseAbility = (ability: CombatAbility): boolean => {
    const cooldown = session.abilityCooldowns[ability.id] || 0;
    const hasEnergy = session.userResources.focusEnergy >= ability.focusEnergyCost;
    return cooldown === 0 && hasEnergy;
  };

  const getAbilityCooldownText = (abilityId: string): string => {
    const cooldown = session.abilityCooldowns[abilityId] || 0;
    return cooldown > 0 ? `${cooldown}s` : '';
  };

  const getComboMultiplierText = (): string => {
    return session.comboCount > 1 ? `${session.comboCount}x` : '';
  };

  // ============================================================================
  // Render Methods
  // ============================================================================

  const renderBossHealth = () => {
    if (!session.currentEncounter) return null;

    const healthPercent = session.currentEncounter.percentHealthRemaining;
    const healthColor = healthPercent > 50 ? theme.colors.success.DEFAULT :
                       healthPercent > 25 ? theme.colors.warning.DEFAULT :
                       theme.colors.error.DEFAULT;

    return (
      <Box mb="md">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="xs">
          <Text variant="h4" color="text.primary">
            {session.currentEncounter.bossName}
          </Text>
          <Text variant="bodySmall" color="text.secondary">
            {Math.round(healthPercent)}%
          </Text>
        </Box>
        
        <Box
          height={8}
          bg="gray.700"
          borderRadius={4}
          overflow="hidden"
          position="relative"
        >
          <Animated.View
            style={{
              height: '100%',
              backgroundColor: healthColor,
              borderRadius: 4,
              width: animations.bossHealthAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
          {showDamageFlash && (
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.5)',
                opacity: animations.damageFlashAnimation,
              }}
            />
          )}
        </Box>
        
        <Box flexDirection="row" justifyContent="space-between" mt="xs">
          <Text variant="caption" color="text.tertiary">
            HP: {session.currentEncounter.bossCurrentHealth}/{session.currentEncounter.bossMaxHealth}
          </Text>
          <Text variant="caption" color="text.tertiary">
            Phase: {session.currentEncounter.currentPhase}
          </Text>
        </Box>
      </Box>
    );
  };

  const renderUserEnergy = () => {
    const { focusEnergy, maxFocusEnergy } = session.userResources;
    const energyPercent = (focusEnergy / maxFocusEnergy) * 100;
    const energyColor = energyPercent > 50 ? theme.colors.success.DEFAULT :
                       energyPercent > 25 ? theme.colors.warning.DEFAULT :
                       theme.colors.error.DEFAULT;

    return (
      <Box mb="md">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="xs">
          <Text variant="h4" color="text.primary">
            Focus Energy
          </Text>
          <Text variant="bodySmall" color="text.secondary">
            {Math.round(energyPercent)}%
          </Text>
        </Box>
        
        <Box
          height={6}
          bg="gray.700"
          borderRadius={3}
          overflow="hidden"
        >
          <Animated.View
            style={{
              height: '100%',
              backgroundColor: energyColor,
              borderRadius: 3,
              width: animations.energyAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </Box>
        
        <Text variant="caption" color="text.tertiary" mt="xs">
          {focusEnergy}/{maxFocusEnergy} ⚡
        </Text>
      </Box>
    );
  };

  const renderAbilities = () => {
    return (
      <Box mb="md">
        <Text variant="h4" color="text.primary" mb="sm">
          Abilities
        </Text>
        <Box flexDirection="row">
          {session.activeAbilities.map((ability, index) => {
            const canUse = canUseAbility(ability);
            const cooldownText = getAbilityCooldownText(ability.id);
            const isLastUsed = lastUsedAbility === ability.id;

            return (
              <TouchableOpacity
                key={ability.id}
                ref={ref => abilityRefs.current[index] = ref}
                onPress={() => handleAbilityUse(ability.id)}
                disabled={!canUse}
                style={[
                  styles.abilityButton,
                  {
                    opacity: canUse ? 1 : 0.5,
                    transform: [{ scale: isLastUsed ? animations.comboAnimation : 1 }],
                  },
                ]}
                accessible={true}
                accessibilityLabel={`${ability.name} ability`}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canUse }}
              >
                <Box
                  bg={canUse ? 'primary.500' : 'gray.400'}
                  borderRadius={12}
                  p="md"
                  alignItems="center"
                  minHeight={80}
                  justifyContent="center"
                  position="relative"
                >
                  <Icon
                    name={ability.icon}
                    size={24}
                    color="white"
                    mb="xs"
                  />
                  
                  <Text
                    variant="caption"
                    color="white"
                    textAlign="center"
                    fontWeight="600"
                  >
                    {ability.name}
                  </Text>
                  
                  <Text
                    variant="caption"
                    color="white"
                    opacity={0.8}
                  >
                    {ability.focusEnergyCost}⚡
                  </Text>
                  
                  {cooldownText && (
                    <Box
                      position="absolute"
                      top={4}
                      right={4}
                      bg="rgba(0,0,0,0.5)"
                      px={2}
                      py={1}
                      borderRadius={4}
                    >
                      <Text
                        variant="caption"
                        color="white"
                        fontSize={8}
                      >
                        {cooldownText}
                      </Text>
                    </Box>
                  )}
                </Box>
              </TouchableOpacity>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderDodgeButton = () => {
    if (!session.combatState.currentAttack) return null;

    return (
      <Box mb="md">
        <TouchableOpacity
          ref={dodgeButtonRef}
          onPress={handleDodgeAttempt}
          style={styles.dodgeButton}
          accessible={true}
          accessibilityLabel="Dodge attack"
          accessibilityRole="button"
          accessibilityHint="Tap to dodge the boss attack"
        >
          <Box
            bg="error.DEFAULT"
            borderRadius={12}
            p="lg"
            alignItems="center"
          >
            <Icon name="shield" size={32} color="white" mb="sm" />
            <Text variant="h4" color="white" fontWeight="600">
              DODGE!
            </Text>
            <Text variant="caption" color="white" opacity={0.8}>
              {session.combatState.currentAttack.replace('_', ' ')}
            </Text>
          </Box>
        </TouchableOpacity>
      </Box>
    );
  };

  const renderComboDisplay = () => {
    if (session.comboCount <= 1) return null;

    return (
      <Box
        position="absolute"
        top={20}
        right={20}
        bg="warning.DEFAULT"
        px="md"
        py="sm"
        borderRadius={20}
      >
        <Animated.View
          style={{
            transform: [{ scale: animations.comboAnimation }],
          }}
        >
          <Text variant="h4" color="white" fontWeight="700">
            {getComboMultiplierText()} COMBO!
          </Text>
        </Animated.View>
      </Box>
    );
  };

  const renderPhaseControls = () => {
    return (
      <Box flexDirection="row" gap="sm">
        {onSkipPhase && (
          <Button
            variant="secondary"
            size="sm"
            onPress={onSkipPhase}
            flex={1}
          >
            Skip
          </Button>
        )}
        {onExtendPhase && (
          <Button
            variant="secondary"
            size="sm"
            onPress={onExtendPhase}
            flex={1}
          >
            +30s
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Box
      bg="background.secondary"
      borderTopLeftRadius={20}
      borderTopRightRadius={20}
      p="lg"
      pt="xl"
      maxHeight="40%"
      position="relative"
    >
      {renderComboDisplay()}
      
      {renderBossHealth()}
      {renderUserEnergy()}
      {renderDodgeButton()}
      {renderAbilities()}
      {renderPhaseControls()}
    </Box>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  abilityButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  dodgeButton: {
    alignSelf: 'center',
  },
});

export default BossCombatHUD;
