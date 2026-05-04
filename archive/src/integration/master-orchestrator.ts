/**
 * Master System Orchestrator - VEX 10/10 Integration
 *
 * Wires all transformation systems together:
 * - Session completion → Mastery XP, Economy, Streaks
 * - Boss damage → Phases, Raid sync, Duel tracking
 * - Daily hooks → Dungeon, Insurance risks
 * - Unified event flow between all subsystems
 *
 * @phase 7 - System Integration
 */

import { eventBus } from '../events';
import type { SessionMode } from '../session/modes';
import { getEnhancedModeConfig, calculateModeBonusDamage } from '../session/modes-enhanced';
import type { BossEncounter } from '../features/boss/schemas';
import { calculateCurrentPhase, handlePhaseTransition, BossPhaseState, createInitialPhaseState } from '../features/boss/boss-phases';
import type { UnifiedMasteryState, SessionMasteryResult } from '../features/progression/unified-mastery';
import { calculateMasteryXpFromSession, applyMasteryXp, checkUnlocks, createInitialMasteryState, migrateFromLegacyProgression } from '../features/progression/unified-mastery';
import type { PrestigeState, PrestigeResult } from '../features/progression/prestige-system';
import { canPrestige, executePrestige, createInitialPrestigeState, migrateToPrestigeSystem } from '../features/progression/prestige-system';
import type { Wallet, Item } from '../features/economy/unified-economy';
import { calculateSessionCoins, calculateDurabilityLoss, createInitialWallet } from '../features/economy/unified-economy';
import type { StreakInsurance, StreakGamble } from '../features/streaks/streak-insurance';
import { assessStreakRisk, createInsurance, calculateInsuranceCost, settleGamble, calculateComebackTokensEarned } from '../features/streaks/streak-insurance';
import type { UserJourneyProgress, JourneyNode, AdvanceXpResult } from '../features/battle-pass/journey-map';
import { generateJourneyMap, createInitialJourneyProgress, advanceJourneyXp, getJourneyProgressPercent } from '../features/battle-pass/journey-map';
import type { DailyDungeon, UserDungeonAttempt } from '../features/daily-dungeon/types';
import { createDailyDungeon, createInitialAttempt, getTimeUntilReset } from '../features/daily-dungeon/types';
import type { FreeTierFeatures, CoachPersona } from '../features/ai-coach/free-tier-system';
import { generateDailyQuest, createInitialFreeTier, migrateToFreeTierSystem, getRandomTip } from '../features/ai-coach/free-tier-system';
import type { SquadRaid } from '../features/squads/squad-raids';
import { RAID_TEMPLATES, calculateRaidDamage, calculateSquadSynergy, distributeRaidRewards } from '../features/squads/squad-raids';
import type { RealtimeDuel, DamageUpdate } from '../features/rivals/realtime-duels';
import { processDamageUpdate, determineDuelWinner, calculateBetPayout } from '../features/rivals/realtime-duels';
import { initializeEmotionRetention } from '../features/emotion-retention';

// ============================================================================
// System State Container
// ============================================================================

export interface IntegratedUserState {
  userId: string;

  // Core progression
  mastery: UnifiedMasteryState;
  prestige: PrestigeState;
  journey: UserJourneyProgress;

  // Economy
  wallet: Wallet;
  inventory: Item[];

  // Streaks & Insurance
  streakDays: number;
  insurance: StreakInsurance | null;
  activeGamble: StreakGamble | null;
  comebackTokens: number;

  // Daily engagement
  todayDungeon: UserDungeonAttempt | null;
  dailyQuestCompleted: boolean;

  // Coach
  coachFeatures: FreeTierFeatures;
  unlockedPersonas: CoachPersona[];
  isPremium: boolean;

  // Social
  activeRaid: SquadRaid | null;
  activeDuel: RealtimeDuel | null;

  // Session tracking
  currentSession: {
    id: string;
    mode: SessionMode;
    startTime: number;
    bossEncounter: BossEncounter | null;
    phaseState: BossPhaseState | null;
    raidSync: boolean;
    duelSync: boolean;
  } | null;
}

// ============================================================================
// Orchestrator Class
// ============================================================================

export class MasterOrchestrator {
  private state: IntegratedUserState;
  private journeyNodes: JourneyNode[];

  constructor(userId: string, seasonId: string) {
    this.state = this.createInitialState(userId, seasonId);
    this.journeyNodes = generateJourneyMap(seasonId);

    this.setupEventListeners();
  }

  // ========================================================================
  // Initialization
  // ========================================================================

  private createInitialState(userId: string, seasonId: string): IntegratedUserState {
    return {
      userId,
      mastery: createInitialMasteryState(userId),
      prestige: createInitialPrestigeState(),
      journey: createInitialJourneyProgress(userId, seasonId),
      wallet: createInitialWallet(userId),
      inventory: [],
      streakDays: 0,
      insurance: null,
      activeGamble: null,
      comebackTokens: 0,
      todayDungeon: null,
      dailyQuestCompleted: false,
      coachFeatures: createInitialFreeTier(),
      unlockedPersonas: ['SUPPORTIVE'],
      isPremium: false,
      activeRaid: null,
      activeDuel: null,
      currentSession: null,
    };
  }

  private setupEventListeners(): void {
    // Session events
    eventBus.subscribe('session:started', this.handleSessionStart.bind(this));
    eventBus.subscribe('session:completed', this.handleSessionComplete.bind(this));
    eventBus.subscribe('session:paused', this.handleSessionPause.bind(this));

    // Boss events
    eventBus.subscribe('boss:damage', this.handleBossDamage.bind(this));
    eventBus.subscribe('boss:defeated', this.handleBossDefeated.bind(this));
    eventBus.subscribe('boss:phase', this.handleBossPhaseChange.bind(this));

    // Social events
    eventBus.subscribe('raid:sync', this.handleRaidSync.bind(this));
    eventBus.subscribe('duel:damage', this.handleDuelDamage.bind(this));

    // Initialize emotion retention system
    initializeEmotionRetention();
  }

  // ========================================================================
  // Session Management
  // ========================================================================

  startSession(
    sessionId: string,
    mode: SessionMode,
    bossEncounter: BossEncounter | null,
    isRaid: boolean = false,
    isDuel: boolean = false
  ): void {
    const phaseState = bossEncounter ? createInitialPhaseState() : null;

    this.state.currentSession = {
      id: sessionId,
      mode,
      startTime: Date.now(),
      bossEncounter,
      phaseState,
      raidSync: isRaid,
      duelSync: isDuel,
    };

    // Check for mode-specific setup
    const modeConfig = getEnhancedModeConfig(mode);
    if (modeConfig.bossConfig.phases.length > 0) {
    (eventBus as any).publish('session:mode_phases', { mode, phases: modeConfig.bossConfig.phases });
    }

    // Check for insurance/gamble prompts
    if (this.state.streakDays >= 3) {
      this.checkStreakRisk();
    }

    // Add daily quest progress
    this.updateQuestProgress('SESSION_COUNT', 1);
  }

  private handleSessionStart(_event: unknown): void {
    // Real-time sync for raids/duels
    if (this.state.activeRaid && this.state.currentSession?.raidSync) {
      this.syncWithRaid();
    }
    if (this.state.activeDuel && this.state.currentSession?.duelSync) {
      this.syncWithDuel();
    }
  }

  // ========================================================================
  // Session Completion - THE BIG INTEGRATION
  // ========================================================================

  completeSession(sessionData: {
    id: string;
    duration: number;
    purityScore: number;
    pauseCount: number;
    wasInterrupted: boolean;
    bossDefeated: boolean;
    bossHealthPercent: number;
    damageDealt: number;
  }): {
    masteryResult: SessionMasteryResult;
    coinsEarned: number;
    unlocks: string[];
    journeyProgress: AdvanceXpResult;
    dungeonProgress: boolean;
  } {
    if (!this.state.currentSession) {
      throw new Error('No active session');
    }

    const session = this.state.currentSession;
    const mode = session.mode;

    // 1. CALCULATE MASTERY XP
    const masteryXp = calculateMasteryXpFromSession(this.state.mastery, {
      duration: sessionData.duration,
      purityScore: sessionData.purityScore,
      pauseCount: sessionData.pauseCount,
      wasInterrupted: sessionData.wasInterrupted,
      streakDays: this.state.streakDays,
      sessionsToday: 1, // TODO: Track properly
      daysActiveThisWeek: 1, // TODO: Track properly
      isComeback: this.state.comebackTokens > 0,
      daysSinceLastSession: 0, // TODO: Calculate
      previousStreak: this.state.streakDays,
      bossDefeated: sessionData.bossDefeated,
      bossHealthPercent: sessionData.bossHealthPercent,
      damageDealt: sessionData.damageDealt,
      fightDuration: sessionData.duration,
      criticalHits: 0, // TODO: Track
    });

    // 2. APPLY MASTERY XP
    const masteryResult = applyMasteryXp(this.state.mastery, masteryXp.byTrack);
    this.state.mastery = masteryResult.newState;

    // 3. CHECK FOR UNLOCKS
    const { newlyUnlocked, allUnlocks } = checkUnlocks(this.state.mastery, this.state.mastery.prestigeBonuses);
    if (newlyUnlocked.length > 0) {
      (eventBus as any).publish('mastery:unlocks', { unlocks: newlyUnlocked });
    }

    // 4. CALCULATE COINS
    let coinsEarned = calculateSessionCoins(
      sessionData.duration,
      sessionData.purityScore,
      this.state.streakDays,
      sessionData.bossDefeated
    );

    // Apply prestige bonuses
    coinsEarned = Math.floor(coinsEarned * (1 + this.getPrestigeBonusPercent('COIN_BOOST') / 100));

    // 5. UPDATE WALLET
    this.state.wallet.coins += coinsEarned;
    this.state.wallet.totalEarnedCoins += coinsEarned;

    // 6. UPDATE STREAK
    if (sessionData.purityScore >= 50 && sessionData.duration >= 15) {
      this.state.streakDays++;
    }

    // 7. JOURNEY MAP PROGRESS
    let journeyXp = (masteryResult as any).totalXp;

    // Apply prestige XP bonus
    journeyXp = Math.floor(journeyXp * (1 + this.getPrestigeBonusPercent('XP_BOOST') / 100));

    const journeyResult = advanceJourneyXp(
      this.state.journey,
      this.journeyNodes,
      journeyXp,
      'session_complete'
    );
    this.state.journey = journeyResult.newProgress;

    // 8. ITEM DURABILITY LOSS
    for (const item of this.state.inventory) {
      if (item.type === 'EQUIPMENT') {
        const loss = calculateDurabilityLoss(
          sessionData.duration,
          sessionData.bossDefeated,
          sessionData.purityScore < 50
        );
        item.durability = Math.max(0, item.durability - loss);
      }
    }

    // 9. DUNGEON PROGRESS
    let dungeonProgress = false;
    if (this.state.todayDungeon && !this.state.todayDungeon.completed) {
      (this.state.todayDungeon as any).damageDealt += (sessionData as any).damageDealt;
      if (sessionData.bossDefeated) {
        this.state.todayDungeon.completed = true;
        this.state.todayDungeon.completedAt = Date.now();
        dungeonProgress = true;

        // Grant guaranteed reward
        // TODO: Add to inventory
      }
    }

    // 10. CHECK FOR PRESTIGE
    if (masteryResult.overallLevelUp && masteryResult.overallLevelUp.newLevel >= 50) {
      this.checkPrestige();
    }

    // 11. QUEST PROGRESS
    this.updateQuestProgress('PURITY_THRESHOLD', sessionData.purityScore);
    if (sessionData.bossDefeated) {
      this.updateQuestProgress('BOSS_DEFEAT', 1);
    }

    // 12. COACH FEEDBACK
    if (this.state.coachFeatures.dailyReminders) {
      const tip = getRandomTip();
      (eventBus as any).publish('coach:message', { tip, persona: 'SUPPORTIVE' });
    }

    // 13. RAID/DUEL SYNC
    if (session.raidSync && this.state.activeRaid) {
      this.completeRaidSession(sessionData);
    }
    if (session.duelSync && this.state.activeDuel) {
      this.completeDuelSession(sessionData);
    }

    // 14. GAMBLE SETTLEMENT
    if (this.state.activeGamble) {
      const grade = sessionData.purityScore >= 90 ? 'S' : sessionData.purityScore >= 80 ? 'A' : 'B';
      const gambleResult = settleGamble(this.state.activeGamble, grade, sessionData.purityScore);

      if (gambleResult.won) {
        this.state.streakDays = gambleResult.newStreakDays;
      } else {
        this.state.comebackTokens += calculateComebackTokensEarned(this.state.streakDays);
        this.state.streakDays = 1;
      }
      this.state.activeGamble = null;
    }

    // Clear current session
    this.state.currentSession = null;

    return {
      masteryResult: masteryResult as any,
      coinsEarned,
      unlocks: newlyUnlocked.map(u => u.id),
      journeyProgress: journeyResult,
      dungeonProgress,
    };
  }

  private handleSessionComplete(_event: unknown): void {
    // Cleanup handled in completeSession method
  }

  // ========================================================================
  // Boss Battle Integration
  // ========================================================================

  private handleBossDamage(event: { encounterId: string; damage: number; userId: string }): void {
    if (!this.state.currentSession?.bossEncounter) {
      return;
    }

    const session = this.state.currentSession;
    const encounter = session.bossEncounter!;

    // Calculate mode bonus
    const modeConfig = getEnhancedModeConfig(session.mode);
    const damageMultiplier = calculateModeBonusDamage(
      session.mode,
      modeConfig.bossConfig.weakness,
      modeConfig.bossConfig.resistance
    );

    const finalDamage = Math.floor(event.damage * damageMultiplier);

    // Update boss health
    encounter.healthRemaining = Math.max(0, encounter.healthRemaining - finalDamage);

    // Check phase transition
    if (session.phaseState) {
      const healthPercent = encounter.healthRemaining / encounter.maxHealth;
      const phaseConfig = modeConfig.bossConfig.phases;

      const { phase, config, changed } = calculateCurrentPhase(
        healthPercent,
        phaseConfig as any,
        session.phaseState
      );

      if (changed) {
        const transition = handlePhaseTransition(
          encounter,
          session.phaseState,
          config,
          85, // Current purity (should be from session tracking)
          0 // Pause count
        );

        (eventBus as any).publish('boss:phase_change', {
          phase,
          transition,
          bossHealth: encounter.healthRemaining,
        });

        session.phaseState.currentPhase = phase;
      }
    }

    // Raid sync
    if (session.raidSync && this.state.activeRaid) {
      this.updateRaidDamage(finalDamage);
    }

    // Duel sync
    if (session.duelSync && this.state.activeDuel) {
      this.updateDuelDamage(finalDamage);
    }
  }

  private handleBossDefeated(_event: unknown): void {
    // Handled in completeSession
  }

  private handleBossPhaseChange(_event: unknown): void {
    // Handled in handleBossDamage
  }

  private handleSessionPause(event: any): void {
    if (!this.state.currentSession?.bossEncounter) {
      return;
    }

    const modeConfig = getEnhancedModeConfig(this.state.currentSession.mode);

    // Regeneration mechanic
    if ((modeConfig as any).bossConfig?.mechanic === 'REGENERATION') {
      const regenAmount = Math.floor(
        this.state.currentSession.bossEncounter.maxHealth * 0.05
      );
      this.state.currentSession.bossEncounter.healthRemaining = Math.min(
        this.state.currentSession.bossEncounter.maxHealth,
        this.state.currentSession.bossEncounter.healthRemaining + regenAmount
      );

      (eventBus as any).publish('boss:regen', { amount: regenAmount });
    }
  }

  // ========================================================================
  // Streak & Insurance
  // ========================================================================

  private checkStreakRisk(): void {
    const assessment = assessStreakRisk(
      this.state.streakDays,
      Date.now() - 24 * 60 * 60 * 1000, // Last session yesterday
      'UTC',
      this.state.wallet.coins,
      !!this.state.insurance,
      this.state.comebackTokens
    );

    if (assessment.riskLevel !== 'NONE') {
      (eventBus as any).publish('streak:risk', { assessment });
    }
  }

  purchaseInsurance(): { success: boolean; cost: number; error?: string } {
    const cost = calculateInsuranceCost(this.state.streakDays);

    if (this.state.wallet.coins < cost) {
      return { success: false, cost, error: 'Insufficient coins' };
    }

    if (this.state.insurance) {
      return { success: false, cost, error: 'Already have active insurance' };
    }

    this.state.wallet.coins -= cost;
    this.state.wallet.totalSpentCoins += cost;
    this.state.insurance = createInsurance(this.state.userId, this.state.streakDays, cost);

    return { success: true, cost };
  }

  // ========================================================================
  // Prestige
  // ========================================================================

  private checkPrestige(): void {
    const check = canPrestige(this.state.mastery, this.state.prestige);
    if (check.canPrestige && check.recommended) {
      (eventBus as any).publish('prestige:available', {
        prestigeLevel: this.state.prestige.prestigeLevel + 1,
      });
    }
  }

  executePrestige(): PrestigeResult {
    const result = executePrestige(this.state.mastery, this.state.prestige);

    if (result.success) {
      this.state.mastery = result.newState;
      this.state.prestige = result.prestigeState;
    }

    return result;
  }

  private getPrestigeBonusPercent(type: string): number {
    // Simplified - would look up actual bonus values
    return this.state.prestige.prestigeLevel * 2; // 2% per prestige level
  }

  // ========================================================================
  // Daily Dungeon
  // ========================================================================

  getDailyDungeon(): { dungeon: DailyDungeon; attempt: UserDungeonAttempt; timeRemaining: { hours: number; minutes: number } } {
    const today = new Date().toISOString().split('T')[0];

    if (!this.state.todayDungeon || this.state.todayDungeon.date !== today) {
      this.state.todayDungeon = createInitialAttempt(this.state.userId, `dungeon_${today}`);
    }

    const dungeon = createDailyDungeon(today);
    const timeRemaining = getTimeUntilReset();

    return {
      dungeon,
      attempt: this.state.todayDungeon,
      timeRemaining,
    };
  }

  // ========================================================================
  // Coach System
  // ========================================================================

  getTodaysQuest() {
    if (this.state.coachFeatures.activeQuests.length === 0) {
      const quest = generateDailyQuest(
        this.state.mastery.overallLevel,
        this.state.streakDays
      );
      this.state.coachFeatures.activeQuests.push(quest);
    }
    return this.state.coachFeatures.activeQuests[0];
  }

  private updateQuestProgress(type: string, value: number): void {
    for (const quest of this.state.coachFeatures.activeQuests) {
      if (quest.requirement.type === type && !quest.completed) {
        quest.progress = Math.min(quest.requirement.value, quest.progress + value);
        if (quest.progress >= quest.requirement.value) {
          quest.completed = true;
          this.grantQuestRewards(quest);
        }
      }
    }
  }

  private grantQuestRewards(quest: ReturnType<typeof this.getTodaysQuest>): void {
    this.state.wallet.coins += quest.reward.coins;
    this.state.wallet.totalEarnedCoins += quest.reward.coins;

    // Remove completed quest
    this.state.coachFeatures.activeQuests = this.state.coachFeatures.activeQuests.filter(
      q => q.id !== quest.id
    );
  }

  // ========================================================================
  // Social Features
  // ========================================================================

  // Raid Sync
  private syncWithRaid(): void {
    // Real-time raid synchronization
    (eventBus as any).publish('raid:participant_ready', {
      userId: this.state.userId,
      raidId: this.state.activeRaid?.id,
    });
  }

  private updateRaidDamage(damage: number): void {
    if (!this.state.activeRaid) {
      return;
    }

    this.state.activeRaid.bossHealth -= damage;
    this.state.activeRaid.totalDamageDealt += damage;

    // Check for phase changes based on health
    const healthPercent = this.state.activeRaid.bossHealth / this.state.activeRaid.bossMaxHealth;
    if (healthPercent <= 0.5 && this.state.activeRaid.bossPhase === 1) {
      this.state.activeRaid.bossPhase = 2;
      (eventBus as any).publish('raid:phase2', { raidId: this.state.activeRaid.id });
    }
    if (healthPercent <= 0.25 && this.state.activeRaid.bossPhase === 2) {
      this.state.activeRaid.bossPhase = 3;
      (eventBus as any).publish('raid:phase3', { raidId: this.state.activeRaid.id });
    }

    // Check for victory
    if (this.state.activeRaid.bossHealth <= 0) {
      this.completeRaid();
    }
  }

  private completeRaidSession(sessionData: {
    duration: number;
    purityScore: number;
    damageDealt: number;
  }): void {
    if (!this.state.activeRaid) {
      return;
    }

    const participant = this.state.activeRaid.participants.find(
      p => p.userId === this.state.userId
    );

    if (participant) {
      (participant as any).sessionCompleted = true;
      (participant as any).damageDealt = (sessionData as any).damageDealt;
      participant.purityScore = sessionData.purityScore;
      participant.sessionDuration = sessionData.duration;

      // Calculate final damage with synergy
      const synergy = calculateSquadSynergy(this.state.activeRaid.participants);
      const finalDamage = calculateRaidDamage(
        participant,
        this.state.activeRaid.templateId.includes('mythic') ? 'MYTHIC' : 'NORMAL',
        synergy
      );

      participant.damageDealt = finalDamage;
    }
  }

  private completeRaid(): void {
    if (!this.state.activeRaid) {
      return;
    }

    const template = RAID_TEMPLATES.find(t => t.id === this.state.activeRaid!.templateId);
    if (!template) {
      return;
    }

    const rewards = distributeRaidRewards(this.state.activeRaid, template);
    const myRewards = rewards.find(r => r.participantId === this.state.userId);

    if (myRewards) {
      this.state.wallet.coins += myRewards.bonusCoins;
      this.state.mastery.tracks.BOSS.totalXp += myRewards.bonusXp;
    }

    this.state.activeRaid.status = 'VICTORY';

    (eventBus as any).publish('raid:completed', {
      raidId: this.state.activeRaid.id,
      rewards: myRewards,
    });
  }

  private handleRaidSync(_event: unknown): void {
    // Real-time updates handled via WebSocket in production
  }

  // Duel Sync
  private syncWithDuel(): void {
    (eventBus as any).publish('duel:participant_ready', {
      userId: this.state.userId,
      duelId: this.state.activeDuel?.id,
    });
  }

  private updateDuelDamage(damage: number): void {
    if (!this.state.activeDuel) {
      return;
    }

    const isChallenger = this.state.activeDuel.challenger.userId === this.state.userId;
    const player = isChallenger
      ? this.state.activeDuel.challenger
      : this.state.activeDuel.opponent;

    player.damageDealt += damage;

    // Process through duel damage system
    const update: DamageUpdate = {
      userId: this.state.userId,
      damage,
      source: 'SESSION_TIME',
      timestamp: Date.now(),
    };

    const result = processDamageUpdate(this.state.activeDuel, update);
    this.state.activeDuel = result.newDuel;

    // Check for boss defeat
    if (result.bossDefeated) {
      this.completeDuel();
    }
  }

  private completeDuelSession(sessionData: {
    duration: number;
    purityScore: number;
    bossDefeated: boolean;
  }): void {
    if (!this.state.activeDuel) {
      return;
    }

    const isChallenger = this.state.activeDuel.challenger.userId === this.state.userId;
    const player = isChallenger
      ? this.state.activeDuel.challenger
      : this.state.activeDuel.opponent;

    player.sessionCompleted = true;
    player.purityScore = sessionData.purityScore;

    if (sessionData.bossDefeated) {
      player.damageDealt = this.state.activeDuel.bossMaxHealth;
    }

    this.completeDuel();
  }

  private completeDuel(): void {
    if (!this.state.activeDuel) {
      return;
    }

    const result = determineDuelWinner(this.state.activeDuel);
    this.state.activeDuel.status = result.status;
    this.state.activeDuel.winner = result.winner;
    this.state.activeDuel.winReason = result.reason;
    this.state.activeDuel.endedAt = Date.now();

    // Handle betting
    if (this.state.activeDuel.config.betAmount > 0) {
      const payout = calculateBetPayout(this.state.activeDuel.config.betAmount);

      if (result.winner === this.state.userId) {
        this.state.wallet.coins += payout.winnerReceives;
      }
    }

    (eventBus as any).publish('duel:completed', {
      duelId: this.state.activeDuel.id,
      result,
    });
  }

  private handleDuelDamage(_event: unknown): void {
    // Handled in updateDuelDamage
  }

  // ========================================================================
  // Getters
  // ========================================================================

  getState(): IntegratedUserState {
    return { ...this.state };
  }

  getMastery(): UnifiedMasteryState {
    return this.state.mastery;
  }

  getWallet(): Wallet {
    return this.state.wallet;
  }

  getJourneyProgress(): { progress: UserJourneyProgress; nodes: JourneyNode[]; percent: number } {
    const { pathPercent } = getJourneyProgressPercent(this.state.journey, this.journeyNodes);
    return {
      progress: this.state.journey,
      nodes: this.journeyNodes,
      percent: pathPercent,
    };
  }

  // ========================================================================
  // Migration Support
  // ========================================================================

  migrateFromLegacy(data: {
    oldLevel: number;
    oldXp: number;
    oldStreak: number;
    hadPremium: boolean;
  }): void {
    // Migrate progression
    this.state.mastery = migrateFromLegacyProgression(
      this.state.userId,
      data.oldLevel,
      data.oldXp
    );

    // Migrate prestige
    const { prestigeState } = migrateToPrestigeSystem(data.oldLevel, 0);
    this.state.prestige = prestigeState;

    // Migrate streak
    this.state.streakDays = data.oldStreak;

    // Migrate coach
    const { freeFeatures, unlockedPersonas, isPremium } = migrateToFreeTierSystem(
      data.hadPremium,
      data.oldLevel
    );
    this.state.coachFeatures = freeFeatures;
    this.state.unlockedPersonas = unlockedPersonas;
    this.state.isPremium = isPremium;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let orchestratorInstance: MasterOrchestrator | null = null;

export function getMasterOrchestrator(userId: string, seasonId: string): MasterOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new MasterOrchestrator(userId, seasonId);
  }
  return orchestratorInstance;
}

export function resetOrchestrator(): void {
  orchestratorInstance = null;
}
