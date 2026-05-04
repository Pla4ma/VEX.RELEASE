/**
 * Ability System
 * 
 * Manages combat abilities, cooldowns, energy costs, and ability usage.
 * Integrates with the session orchestrator to provide combat mechanics.
 */

import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';
import type { SessionV2State, UserResources, CombatAbility, CombatAbilityConfig } from './types';

const debug = createDebugger('session:v2:ability-system');

// ============================================================================
// Ability System
// ============================================================================

export interface AbilityUseResult {
  success: boolean;
  damage: number;
  energyCost: number;
  newResources: UserResources;
  newCooldowns: Record<string, number>;
  message?: string;
}

export class AbilitySystem {
  private session: SessionV2State | null = null;
  private isRunning = false;
  private isPaused = false;
  
  // Cooldown tracking
  private cooldownTimers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    debug.info('AbilitySystem initialized');
  }
  
  // ============================================================================
  // Lifecycle Methods
  // ============================================================================
  
  initialize(session: SessionV2State): void {
    this.session = session;
    this.isRunning = false;
    this.isPaused = false;
    
    debug.info('AbilitySystem initialized for session: %s', session.id);
  }
  
  start(): void {
    if (!this.session || this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    
    debug.info('AbilitySystem started');
  }
  
  pause(): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    this.isPaused = true;
    
    // Pause cooldown timers
    this.pauseCooldownTimers();
    
    debug.info('AbilitySystem paused');
  }
  
  resume(): void {
    if (!this.isRunning || !this.isPaused) {
      return;
    }
    
    this.isPaused = false;
    
    // Resume cooldown timers
    this.resumeCooldownTimers();
    
    debug.info('AbilitySystem resumed');
  }
  
  cleanup(): void {
    // Clear all cooldown timers
    this.clearCooldownTimers();
    
    this.session = null;
    this.isRunning = false;
    this.isPaused = false;
    
    debug.info('AbilitySystem cleaned up');
  }
  
  // ============================================================================
  // Ability Management
  // ============================================================================
  
  async getAvailableAbilities(userId: string, session: SessionV2State): Promise<CombatAbility[]> {
    // Get base abilities
    const baseAbilities = this.getBaseAbilities();
    
    // Filter by user level (would get from progression system)
    const userLevel = 1; // Placeholder
    
    // Filter abilities that are unlocked at this level
    const availableAbilities = baseAbilities.filter(ability => 
      !ability.requiresLevel || ability.requiresLevel <= userLevel
    );
    
    debug.info('Available abilities: %d', availableAbilities.length);
    return availableAbilities;
  }
  
  async useAbility(
    abilityId: string,
    currentResources: UserResources,
    currentCooldowns: Record<string, number>,
    combatState: any
  ): Promise<AbilityUseResult> {
    if (!this.session || !this.isRunning || this.isPaused) {
      return {
        success: false,
        damage: 0,
        energyCost: 0,
        newResources: currentResources,
        newCooldowns: currentCooldowns,
        message: 'System not ready',
      };
    }
    
    // Find ability
    const ability = this.session.activeAbilities.find(a => a.id === abilityId);
    if (!ability) {
      return {
        success: false,
        damage: 0,
        energyCost: 0,
        newResources: currentResources,
        newCooldowns: currentCooldowns,
        message: 'Ability not found',
      };
    }
    
    // Check cooldown
    const cooldownRemaining = currentCooldowns[abilityId] || 0;
    if (cooldownRemaining > 0) {
      return {
        success: false,
        damage: 0,
        energyCost: 0,
        newResources: currentResources,
        newCooldowns: currentCooldowns,
        message: `Ability on cooldown (${cooldownRemaining}s remaining)`,
      };
    }
    
    // Check energy
    if (currentResources.focusEnergy < ability.focusEnergyCost) {
      return {
        success: false,
        damage: 0,
        energyCost: 0,
        newResources: currentResources,
        newCooldowns: currentCooldowns,
        message: 'Insufficient energy',
      };
    }
    
    // Check streak requirement
    if (ability.requiresStreak > 0) {
      // Would check current streak from progression system
      const currentStreak = 1; // Placeholder
      if (currentStreak < ability.requiresStreak) {
        return {
          success: false,
          damage: 0,
          energyCost: 0,
          newResources: currentResources,
          newCooldowns: currentCooldowns,
          message: `Requires ${ability.requiresStreak} day streak`,
        };
      }
    }
    
    // Execute ability
    const result = this.executeAbility(ability, currentResources, combatState);
    
    // Update cooldowns
    const newCooldowns = { ...currentCooldowns };
    newCooldowns[abilityId] = ability.cooldownSeconds;
    this.startCooldownTimer(abilityId, ability.cooldownSeconds);
    
    // Update resources
    const newResources = { ...currentResources };
    newResources.focusEnergy -= ability.focusEnergyCost;
    
    // Emit ability used event
    eventBus.publish('combat:ability_executed', {
      sessionId: this.session.id,
      userId: this.session.userId,
      abilityId,
      damage: result.damage,
      energyCost: ability.focusEnergyCost,
    });
    
    debug.info('Ability used: %s, damage: %d, energy: %d', abilityId, result.damage, ability.focusEnergyCost);
    
    return {
      success: true,
      damage: result.damage,
      energyCost: ability.focusEnergyCost,
      newResources,
      newCooldowns,
      message: result.message,
    };
  }
  
  // ============================================================================
  // Cooldown Management
  // ============================================================================
  
  private startCooldownTimer(abilityId: string, cooldownSeconds: number): void {
    // Clear existing timer if any
    const existingTimer = this.cooldownTimers.get(abilityId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Start new timer
    const timer = setTimeout(() => {
      this.clearCooldown(abilityId);
    }, cooldownSeconds * 1000);
    
    this.cooldownTimers.set(abilityId, timer);
  }
  
  private clearCooldown(abilityId: string): void {
    if (!this.session) return;
    
    // Clear from session cooldowns
    delete this.session.abilityCooldowns[abilityId];
    
    // Clear timer
    const timer = this.cooldownTimers.get(abilityId);
    if (timer) {
      clearTimeout(timer);
      this.cooldownTimers.delete(abilityId);
    }
    
    // Emit cooldown ready event
    eventBus.publish('combat:ability_ready', {
      sessionId: this.session.id,
      userId: this.session.userId,
      abilityId,
    });
    
    debug.info('Cooldown ready: %s', abilityId);
  }
  
  private pauseCooldownTimers(): void {
    // Store remaining times for resume
    if (!this.session) return;
    
    for (const [abilityId, timer] of this.cooldownTimers) {
      clearTimeout(timer);
      
      // Store remaining time (simplified - would need to track exact remaining time)
      const cooldownRemaining = this.session.abilityCooldowns[abilityId] || 0;
      if (cooldownRemaining > 0) {
        // This is simplified - in production, you'd store exact pause time
      }
    }
    
    this.cooldownTimers.clear();
  }
  
  private resumeCooldownTimers(): void {
    // Restart timers with remaining time
    if (!this.session) return;
    
    for (const [abilityId, cooldownRemaining] of Object.entries(this.session.abilityCooldowns)) {
      if (cooldownRemaining > 0) {
        this.startCooldownTimer(abilityId, cooldownRemaining);
      }
    }
  }
  
  private clearCooldownTimers(): void {
    for (const timer of this.cooldownTimers.values()) {
      clearTimeout(timer);
    }
    this.cooldownTimers.clear();
  }
  
  // ============================================================================
  // Ability Execution
  // ============================================================================
  
  private executeAbility(
    ability: CombatAbility,
    resources: UserResources,
    combatState: any
  ): { damage: number; message: string } {
    // Base damage calculation
    let damage = ability.baseDamage;
    
    // Apply combo multiplier from session
    if (this.session) {
      damage = Math.floor(damage * this.session.comboMultiplier);
    }
    
    // Apply purity bonus (would get from session metrics)
    const purityScore = 80; // Placeholder
    const purityMultiplier = 0.5 + (purityScore / 100) * 1.5; // 0.5x to 2x
    damage = Math.floor(damage * purityMultiplier);
    
    // Generate message
    const message = this.generateAbilityMessage(ability, damage);
    
    return { damage, message };
  }
  
  private generateAbilityMessage(ability: CombatAbility, damage: number): string {
    const messages: Record<string, string> = {
      'FOCUS_STRIKE': `Focused strike deals ${damage} damage!`,
      'DEEP_WORK_PUNCH': `Deep work punch hits for ${damage}!`,
      'SPPRINT_SLASH': `Sprint slash cuts for ${damage}!`,
      'CREATIVE_BURST': `Creative burst explodes for ${damage}!`,
      'STUDY_SMASH': `Study smash crushes for ${damage}!`,
    };
    
    return messages[ability.id] || `${ability.name} deals ${damage} damage!`;
  }
  
  // ============================================================================
  // Base Abilities
  // ============================================================================
  
  private getBaseAbilities(): CombatAbility[] {
    return [
      {
        id: 'FOCUS_STRIKE',
        name: 'Focus Strike',
        description: 'A basic attack that focuses your energy into a strike',
        focusEnergyCost: 10,
        baseDamage: 25,
        cooldownSeconds: 3,
        requiresStreak: 0,
        requiresLevel: 1,
        icon: 'sword',
      },
      {
        id: 'DEEP_WORK_PUNCH',
        name: 'Deep Work Punch',
        description: 'A powerful punch that requires deep concentration',
        focusEnergyCost: 20,
        baseDamage: 50,
        cooldownSeconds: 8,
        requiresStreak: 0,
        requiresLevel: 3,
        icon: 'fist',
      },
      {
        id: 'SPRINT_SLASH',
        name: 'Sprint Slash',
        description: 'A quick slash that builds momentum',
        focusEnergyCost: 15,
        baseDamage: 35,
        cooldownSeconds: 5,
        requiresStreak: 0,
        requiresLevel: 2,
        icon: 'bolt',
      },
      {
        id: 'CREATIVE_BURST',
        name: 'Creative Burst',
        description: 'An explosive attack that unlocks creative potential',
        focusEnergyCost: 25,
        baseDamage: 60,
        cooldownSeconds: 10,
        requiresStreak: 3,
        requiresLevel: 5,
        icon: 'sparkles',
      },
      {
        id: 'STUDY_SMASH',
        name: 'Study Smash',
        description: 'A devastating smash powered by knowledge',
        focusEnergyCost: 30,
        baseDamage: 80,
        cooldownSeconds: 15,
        requiresStreak: 5,
        requiresLevel: 7,
        icon: 'book',
      },
    ];
  }
  
  // ============================================================================
  // Public API
  // ============================================================================
  
  getAbilityCooldown(abilityId: string): number {
    if (!this.session) return 0;
    return this.session.abilityCooldowns[abilityId] || 0;
  }
  
  getAllCooldowns(): Record<string, number> {
    if (!this.session) return {};
    return { ...this.session.abilityCooldowns };
  }
  
  canUseAbility(abilityId: string): boolean {
    if (!this.session) return false;
    
    const ability = this.session.activeAbilities.find(a => a.id === abilityId);
    if (!ability) return false;
    
    const cooldownRemaining = this.session.abilityCooldowns[abilityId] || 0;
    const hasEnergy = this.session.userResources.focusEnergy >= ability.focusEnergyCost;
    
    return cooldownRemaining === 0 && hasEnergy;
  }
  
  update(timestamp: number): void {
    if (!this.isRunning || this.isPaused || !this.session) {
      return;
    }
    
    // Update cooldowns (handled by timers)
    // Could add periodic checks here if needed
  }
}
