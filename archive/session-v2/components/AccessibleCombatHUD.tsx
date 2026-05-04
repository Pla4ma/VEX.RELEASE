/**
 * Accessible Combat HUD
 * 
 * Enhanced combat HUD with comprehensive accessibility support.
 * Includes screen reader announcements, reduced motion, and keyboard navigation.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, Platform, AccessibilityInfo } from 'react-native';
import { useTheme } from '../../theme';
import { Box, Button } from '../../components/primitives';
import { Icon } from '../../icons';
import type { SessionV2State, CombatAbility } from '../../session-v2/types';

// ============================================================================
// Types
// ============================================================================

interface AccessibleCombatHUDProps {
  session: SessionV2State;
  onAbilityUse: (abilityId: string) => void;
  onDodgeAttempt: () => void;
  onSkipPhase?: () => void;
  onExtendPhase?: () => void;
  reducedMotion?: boolean;
  screenReaderEnabled?: boolean;
}

interface AccessibilityAnnouncement {
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

// ============================================================================
// Accessible Combat HUD
// ============================================================================

export const AccessibleCombatHUD: React.FC<AccessibleCombatHUDProps> = ({
  session,
  onAbilityUse,
  onDodgeAttempt,
  onSkipPhase,
  onExtendPhase,
  reducedMotion = false,
  screenReaderEnabled = false,
}) => {
  const { theme } = useTheme();
  
  // Animation refs
  const bossHealthAnim = useRef(new Animated.Value(0)).current;
  const energyAnim = useRef(new Animated.Value(0)).current;
  const comboAnim = useRef(new Animated.Value(1)).current;
  
  // Accessibility state
  const [announcements, setAnnouncements] = useState<AccessibilityAnnouncement[]>([]);
  const [focusedAbilityIndex, setFocusedAbilityIndex] = useState(0);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(screenReaderEnabled);
  
  // Refs for focus management
  const abilityRefs = useRef<(TouchableOpacity | null)[]>([]);
  const dodgeButtonRef = useRef<TouchableOpacity>(null);
  const skipButtonRef = useRef<TouchableOpacity>(null);
  const extendButtonRef = useRef<TouchableOpacity>(null);

  // Check screen reader status on mount
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      AccessibilityInfo.isScreenReaderEnabled()
        .then(setIsScreenReaderEnabled)
        .catch(() => {}); // Silently fail if not supported
    }
  }, []);

  // Animate values with reduced motion consideration
  useEffect(() => {
    if (session.currentEncounter) {
      const healthPercent = session.currentEncounter.percentHealthRemaining / 100;
      const animationConfig = reducedMotion 
        ? { duration: 0, useNativeDriver: false }
        : { duration: 300, useNativeDriver: false };
      
      Animated.timing(bossHealthAnim, {
        toValue: healthPercent,
        ...animationConfig,
      }).start();
    }
  }, [session.currentEncounter?.percentHealthRemaining, bossHealthAnim, reducedMotion]);

  useEffect(() => {
    const energyPercent = session.userResources.focusEnergy / session.userResources.maxFocusEnergy;
    const animationConfig = reducedMotion 
      ? { duration: 0, useNativeDriver: false }
      : { duration: 300, useNativeDriver: false };
    
    Animated.timing(energyAnim, {
      toValue: energyPercent,
      ...animationConfig,
    }).start();
  }, [session.userResources.focusEnergy, session.userResources.maxFocusEnergy, energyAnim, reducedMotion]);

  useEffect(() => {
    if (session.comboCount > 1 && !reducedMotion) {
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
      
      // Announce combo achievement
      announceToScreenReader(
        `Combo achieved: ${session.comboCount}x. ${session.comboMultiplier.toFixed(1)}x damage multiplier.`,
        'medium'
      );
    }
  }, [session.comboCount, comboAnim, reducedMotion]);

  // ============================================================================
  // Accessibility Announcements
  // ============================================================================

  const announceToScreenReader = useCallback((message: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (!isScreenReaderEnabled) return;

    const announcement: AccessibilityAnnouncement = {
      message,
      priority,
      timestamp: Date.now(),
    };

    setAnnouncements(prev => {
      const updated = [...prev, announcement];
      // Keep only last 10 announcements
      return updated.slice(-10);
    });

    // Announce immediately for high priority
    if (priority === 'high') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [isScreenReaderEnabled]);

  // Announce important state changes
  useEffect(() => {
    if (!isScreenReaderEnabled) return;

    // Boss phase changes
    if (session.currentEncounter) {
      const phaseMessage = `Boss phase: ${session.currentEncounter.currentPhase}. Health: ${Math.round(session.currentEncounter.percentHealthRemaining)}%`;
      announceToScreenReader(phaseMessage, 'medium');
    }

    // Attack patterns
    if (session.combatState.currentAttack) {
      const attackMessage = `Boss attacking with ${session.combatState.currentAttack.replace('_', ' ')}! Dodge available.`;
      announceToScreenReader(attackMessage, 'high');
    }
  }, [session.currentEncounter?.currentPhase, session.currentEncounter?.percentHealthRemaining, session.combatState.currentAttack, isScreenReaderEnabled, announceToScreenReader]);

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  const handleAbilityKeyPress = useCallback((abilityIndex: number) => {
    if (abilityIndex >= 0 && abilityIndex < session.activeAbilities.length) {
      const ability = session.activeAbilities[abilityIndex];
      const canUse = checkAbilityCanUse(ability);
      
      if (canUse) {
        onAbilityUse(ability.id);
        announceToScreenReader(`Used ${ability.name}. Dealt damage to boss.`, 'medium');
      } else {
        const reason = getAbilityCannotUseReason(ability);
        announceToScreenReader(`Cannot use ${ability.name}. ${reason}`, 'low');
      }
    }
  }, [session.activeAbilities, onAbilityUse, announceToScreenReader]);

  const handleDodgeKeyPress = useCallback(() => {
    if (session.combatState.currentAttack) {
      onDodgeAttempt();
      announceToScreenReader('Dodge attempted!', 'medium');
    } else {
      announceToScreenReader('No attack to dodge.', 'low');
    }
  }, [session.combatState.currentAttack, onDodgeAttempt, announceToScreenReader]);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const checkAbilityCanUse = (ability: CombatAbility): boolean => {
    const cooldown = session.abilityCooldowns[ability.id] || 0;
    const hasEnergy = session.userResources.focusEnergy >= ability.focusEnergyCost;
    return cooldown === 0 && hasEnergy;
  };

  const getAbilityCannotUseReason = (ability: CombatAbility): string => {
    const cooldown = session.abilityCooldowns[ability.id] || 0;
    const hasEnergy = session.userResources.focusEnergy >= ability.focusEnergyCost;
    
    if (cooldown > 0) {
      return `On cooldown for ${cooldown} seconds.`;
    }
    if (!hasEnergy) {
      return `Not enough energy. Need ${ability.focusEnergyCost}, have ${session.userResources.focusEnergy}.`;
    }
    return 'Not available.';
  };

  const getAccessibilityLabelForAbility = (ability: CombatAbility, index: number): string => {
    const canUse = checkAbilityCanUse(ability);
    const cooldown = session.abilityCooldowns[ability.id] || 0;
    const energy = session.userResources.focusEnergy;
    const energyCost = ability.focusEnergyCost;
    
    let label = `${ability.name}. Ability ${index + 1} of ${session.activeAbilities.length}. `;
    label += `Damage: ${ability.baseDamage}. Energy cost: ${energyCost}. `;
    
    if (canUse) {
      label += 'Available. Double tap to use.';
    } else {
      label += 'Unavailable. ';
      if (cooldown > 0) {
        label += `Cooldown: ${cooldown} seconds. `;
      }
      if (energy < energyCost) {
        label += `Not enough energy. Have ${energy}, need ${energyCost}.`;
      }
    }
    
    return label;
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
      <View style={{ marginBottom: 16 }} accessible={true}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Text 
            style={{ color: theme.colors.text.primary, fontWeight: '600' }}
            accessible={true}
            accessibilityLabel={`Boss: ${session.currentEncounter.bossName}`}
          >
            {session.currentEncounter.bossName}
          </Text>
          <Text 
            style={{ color: theme.colors.text.secondary, fontSize: 12 }}
            accessible={true}
            accessibilityLabel={`Health: ${Math.round(healthPercent)} percent`}
          >
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
          accessible={true}
          accessibilityLabel={`Boss health bar: ${Math.round(healthPercent)} percent`}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(healthPercent) }}
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
          <Text 
            style={{ color: theme.colors.text.secondary, fontSize: 10 }}
            accessible={true}
            accessibilityLabel={`Health: ${session.currentEncounter.bossCurrentHealth} of ${session.currentEncounter.bossMaxHealth}`}
          >
            HP: {session.currentEncounter.bossCurrentHealth}/{session.currentEncounter.bossMaxHealth}
          </Text>
          <Text 
            style={{ color: theme.colors.text.secondary, fontSize: 10 }}
            accessible={true}
            accessibilityLabel={`Phase: ${session.currentEncounter.currentPhase}`}
          >
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
      <View style={{ marginBottom: 16 }} accessible={true}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Text 
            style={{ color: theme.colors.text.primary, fontWeight: '600' }}
            accessible={true}
            accessibilityLabel="Focus Energy"
          >
            Focus Energy
          </Text>
          <Text 
            style={{ color: theme.colors.text.secondary, fontSize: 12 }}
            accessible={true}
            accessibilityLabel={`Energy: ${Math.round(energyPercent)} percent`}
          >
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
          accessible={true}
          accessibilityLabel={`Energy bar: ${Math.round(energyPercent)} percent`}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(energyPercent) }}
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
        
        <Text 
          style={{ color: theme.colors.text.secondary, fontSize: 10, marginTop: 2 }}
          accessible={true}
          accessibilityLabel={`Energy: ${focusEnergy} of ${maxFocusEnergy}`}
        >
          {focusEnergy}/{maxFocusEnergy} ⚡
        </Text>
      </View>
    );
  };

  const renderAbilities = () => {
    return (
      <View style={{ marginBottom: 16 }} accessible={true}>
        <Text 
          style={{ color: theme.colors.text.primary, fontWeight: '600', marginBottom: 8 }}
          accessible={true}
          accessibilityLabel={`Abilities: ${session.activeAbilities.length} available`}
        >
          Abilities
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {session.activeAbilities.map((ability, index) => (
            <TouchableOpacity
              key={ability.id}
              ref={ref => abilityRefs.current[index] = ref}
              onPress={() => handleAbilityKeyPress(index)}
              disabled={!checkAbilityCanUse(ability)}
              style={{
                flex: 1,
                marginHorizontal: 4,
                opacity: checkAbilityCanUse(ability) ? 1 : 0.5,
              }}
              accessible={true}
              accessibilityLabel={getAccessibilityLabelForAbility(ability, index)}
              accessibilityRole="button"
              accessibilityState={{ disabled: !checkAbilityCanUse(ability) }}
            >
              <View
                style={{
                  backgroundColor: checkAbilityCanUse(ability) ? theme.colors.primary[500] : theme.colors.gray[400],
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
                  accessible={false}
                />
                
                <Text
                  style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                  accessible={false}
                >
                  {ability.name}
                </Text>
                
                <Text
                  style={{
                    color: 'white',
                    fontSize: 8,
                    opacity: 0.8,
                  }}
                  accessible={false}
                >
                  {ability.focusEnergyCost}⚡
                </Text>
                
                {session.abilityCooldowns[ability.id] > 0 && (
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
                    accessible={false}
                  >
                    {session.abilityCooldowns[ability.id]}s
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderDodgeButton = () => {
    if (!session.combatState.currentAttack) return null;

    return (
      <TouchableOpacity
        ref={dodgeButtonRef}
        onPress={handleDodgeKeyPress}
        style={{
          backgroundColor: theme.colors.error.DEFAULT,
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginBottom: 16,
        }}
        accessible={true}
        accessibilityLabel="Dodge button. Dodge the current boss attack."
        accessibilityRole="button"
        accessibilityHint="Double tap to dodge the boss attack"
      >
        <Icon name="shield" size={24} color="white" style={{ marginBottom: 4 }} accessible={false} />
        <Text style={{ color: 'white', fontWeight: '600' }}>DODGE!</Text>
      </TouchableOpacity>
    );
  };

  const renderPhaseControls = () => {
    return (
      <View style={{ flexDirection: 'row', gap: 8 }} accessible={true}>
        {onSkipPhase && (
          <Button
            ref={skipButtonRef}
            variant="secondary"
            size="sm"
            onPress={onSkipPhase}
            style={{ flex: 1 }}
            accessible={true}
            accessibilityLabel="Skip current phase"
            accessibilityRole="button"
          >
            Skip
          </Button>
        )}
        {onExtendPhase && (
          <Button
            ref={extendButtonRef}
            variant="secondary"
            size="sm"
            onPress={onExtendPhase}
            style={{ flex: 1 }}
            accessible={true}
            accessibilityLabel="Extend current phase by 30 seconds"
            accessibilityRole="button"
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
        maxHeight: '40%',
      }}
      accessible={true}
      accessibilityLabel="Combat heads up display"
    >
      {renderBossHealth()}
      {renderUserEnergy()}
      {renderDodgeButton()}
      {renderAbilities()}
      {renderPhaseControls()}
    </View>
  );
};
