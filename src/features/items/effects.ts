import { z } from 'zod';
import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { generateUUID } from '../../session/utils/idGenerator';
import { createDebugger } from '../../utils/debug';
import * as analytics from './analytics';

const debug = createDebugger('items-effects');
const storage = getDefaultStorageAdapter();
const STORAGE_KEY = 'items:activeEffects';
const EffectFailureSchema = z.object({ type: z.string(), reason: z.string() });
const EffectConflictSchema = z.object({ existingEffectId: z.string(), newEffectType: z.string(), resolution: z.enum(['STACKED', 'REPLACED', 'BLOCKED']) });

export const EffectTypeSchema = z.enum([
  'HEAL',
  'REGENERATION',
  'REVIVE',
  'BOOST_XP',
  'BOOST_COINS',
  'BOOST_DAMAGE',
  'BOOST_DEFENSE',
  'BOOST_SPEED',
  'SHIELD',
  'STREAK_PROTECTION',
  'FOCUS_ENHANCEMENT',
  'TIME_EXTENSION',
  'COOLDOWN_REDUCTION',
  'BONUS_DROP_RATE',
  'CRITICAL_CHANCE',
  'RESOURCE_EFFICIENCY',
  'BOOST_STREAK',
  'BONUS_DAMAGE',
  'BONUS_DEFENSE',
]);
export const EffectCategorySchema = z.enum(['IMMEDIATE', 'DURATION', 'PERMANENT', 'CHARGE', 'TRIGGER']);
export const EffectTargetSchema = z.enum(['SELF', 'SQUAD', 'ALL', 'SESSION']);
export const ActiveEffectSchema = z.object({ id: z.string().uuid(), userId: z.string().uuid(), type: EffectTypeSchema, category: EffectCategorySchema, target: EffectTargetSchema, value: z.number(), originalValue: z.number(), startedAt: z.number().int(), expiresAt: z.number().int().nullable(), durationSeconds: z.number().int().nullable(), chargesRemaining: z.number().int().nullable(), maxCharges: z.number().int().nullable(), sourceItemId: z.string().uuid().nullable(), sourceType: z.enum(['ITEM', 'EQUIPMENT', 'PERK', 'EVENT']), stackId: z.string().nullable(), stackCount: z.number().int().default(1), maxStacks: z.number().int().default(1), isActive: z.boolean().default(true), isPaused: z.boolean().default(false), pausedAt: z.number().int().nullable(), metadata: z.record(z.unknown()).default({}) }).strict();
export const EffectResultSchema = z.object({ success: z.boolean(), effectType: EffectTypeSchema.nullable(), message: z.string(), appliedEffects: z.array(ActiveEffectSchema).default([]), failedEffects: z.array(EffectFailureSchema.extend({ type: EffectTypeSchema })).default([]), conflicts: z.array(EffectConflictSchema.extend({ newEffectType: EffectTypeSchema })).default([]) }).strict();

export type EffectType = z.infer<typeof EffectTypeSchema>;
export type EffectCategory = z.infer<typeof EffectCategorySchema>;
export type EffectTarget = z.infer<typeof EffectTargetSchema>;
export type ActiveEffect = z.infer<typeof ActiveEffectSchema>;
export type EffectResult = z.infer<typeof EffectResultSchema>;

type BoostEffectType = 'BOOST_XP' | 'BOOST_COINS' | 'BOOST_DAMAGE' | 'BOOST_DEFENSE';
type EffectSourceType = ActiveEffect['sourceType'];
type EffectOptions = { sourceItemId?: string; sourceType?: EffectSourceType; duration?: number; charges?: number; target?: EffectTarget; metadata?: Record<string, unknown> };
type EffectDefinition = { category: EffectCategory; defaultDuration: number | null; maxStacks: number; replaceExisting: boolean };

const EFFECT_DEFINITIONS: Record<EffectType, EffectDefinition> = {
  HEAL: { category: 'IMMEDIATE', defaultDuration: null, maxStacks: 1, replaceExisting: false },
  REGENERATION: { category: 'DURATION', defaultDuration: 300, maxStacks: 3, replaceExisting: false },
  REVIVE: { category: 'IMMEDIATE', defaultDuration: null, maxStacks: 1, replaceExisting: false },
  BOOST_XP: { category: 'DURATION', defaultDuration: 1800, maxStacks: 1, replaceExisting: true },
  BOOST_COINS: { category: 'DURATION', defaultDuration: 1800, maxStacks: 1, replaceExisting: true },
  BOOST_DAMAGE: { category: 'DURATION', defaultDuration: 600, maxStacks: 2, replaceExisting: false },
  BOOST_DEFENSE: { category: 'DURATION', defaultDuration: 600, maxStacks: 2, replaceExisting: false },
  BOOST_SPEED: { category: 'DURATION', defaultDuration: 300, maxStacks: 1, replaceExisting: true },
  SHIELD: { category: 'CHARGE', defaultDuration: null, maxStacks: 1, replaceExisting: false },
  STREAK_PROTECTION: { category: 'CHARGE', defaultDuration: null, maxStacks: 1, replaceExisting: true },
  FOCUS_ENHANCEMENT: { category: 'DURATION', defaultDuration: 1800, maxStacks: 1, replaceExisting: true },
  TIME_EXTENSION: { category: 'IMMEDIATE', defaultDuration: null, maxStacks: 1, replaceExisting: false },
  COOLDOWN_REDUCTION: { category: 'DURATION', defaultDuration: 300, maxStacks: 1, replaceExisting: true },
  BONUS_DROP_RATE: { category: 'DURATION', defaultDuration: 3600, maxStacks: 1, replaceExisting: true },
  CRITICAL_CHANCE: { category: 'DURATION', defaultDuration: 600, maxStacks: 2, replaceExisting: false },
  RESOURCE_EFFICIENCY: { category: 'DURATION', defaultDuration: 1800, maxStacks: 1, replaceExisting: true },
  BOOST_STREAK: { category: 'DURATION', defaultDuration: 1800, maxStacks: 1, replaceExisting: true },
  BONUS_DAMAGE: { category: 'DURATION', defaultDuration: 600, maxStacks: 2, replaceExisting: false },
  BONUS_DEFENSE: { category: 'DURATION', defaultDuration: 600, maxStacks: 2, replaceExisting: false },
};

class EffectStore {
  private effects = new Map<string, ActiveEffect>();
  private userEffects = new Map<string, Set<string>>();

  constructor() { this.loadFromStorage(); setInterval(() => this.cleanupExpired(), 60000); }

  private linkEffect(effect: ActiveEffect): void {
    this.effects.set(effect.id, effect);
    const userSet = this.userEffects.get(effect.userId) ?? new Set<string>();
    userSet.add(effect.id);
    this.userEffects.set(effect.userId, userSet);
  }

  private loadFromStorage(): void {
    try {
      const parsed = storage.getJSONSync<unknown>(STORAGE_KEY);
      if (!parsed) {return;}
      for (const effect of z.array(ActiveEffectSchema).parse(parsed)) {if (effect.isActive && (effect.expiresAt === null || effect.expiresAt > Date.now())) {this.linkEffect(effect);}}
    } catch (error) {
      debug.error('Failed to load effects from storage', error instanceof Error ? error : new Error('Unknown storage load error'));
    }
  }

  private saveToStorage(): void {
    try {
      storage.setJSONSync(STORAGE_KEY, Array.from(this.effects.values()));
    } catch (error) {
      debug.error('Failed to save effects to storage', error instanceof Error ? error : new Error('Unknown storage save error'));
    }
  }

  add(effect: ActiveEffect): void { this.linkEffect(effect); this.saveToStorage(); }
  getByUser(userId: string): ActiveEffect[] { return Array.from(this.userEffects.get(userId) ?? []).map((id) => this.effects.get(id)).filter((effect): effect is ActiveEffect => Boolean(effect?.isActive)); }
  getByType(userId: string, type: EffectType): ActiveEffect[] { return this.getByUser(userId).filter((effect) => effect.type === type); }
  update(id: string, updates: Partial<ActiveEffect>): ActiveEffect | null { const effect = this.effects.get(id); if (!effect) {return null;} const updated: ActiveEffect = { ...effect, ...updates }; this.effects.set(id, updated); this.saveToStorage(); return updated; }

  remove(id: string): boolean {
    const effect = this.effects.get(id);
    if (!effect) {return false;}
    this.effects.delete(id);
    this.userEffects.get(effect.userId)?.delete(id);
    this.saveToStorage();
    return true;
  }

  async applyEffect(userId: string, type: EffectType, value: number, options: EffectOptions = {}): Promise<EffectResult> {
    const definition = EFFECT_DEFINITIONS[type];
    const conflicts: EffectResult['conflicts'] = [];
    for (const existing of this.getByType(userId, type)) {
      if (definition.replaceExisting) { this.remove(existing.id); conflicts.push({ existingEffectId: existing.id, newEffectType: type, resolution: 'REPLACED' }); continue; }
      if (definition.maxStacks > 1 && existing.stackCount < definition.maxStacks) {
        const updated = this.update(existing.id, { stackCount: existing.stackCount + 1, value: existing.value + value });
        analytics.trackItemEffectApplied(userId, options.sourceItemId ?? 'unknown', [type]);
        return { success: true, effectType: type, message: `Effect stacked (${existing.stackCount + 1}/${definition.maxStacks})`, appliedEffects: updated ? [updated] : [], failedEffects: [], conflicts: [...conflicts, { existingEffectId: existing.id, newEffectType: type, resolution: 'STACKED' }] };
      }
      return { success: false, effectType: type, message: 'Max stacks reached', appliedEffects: [], failedEffects: [{ type, reason: 'Max stacks reached' }], conflicts: [...conflicts, { existingEffectId: existing.id, newEffectType: type, resolution: 'BLOCKED' }] };
    }
    const now = Date.now();
    const duration = options.duration ?? definition.defaultDuration;
    const effect: ActiveEffect = { id: generateUUID(), userId, type, category: definition.category, target: options.target ?? 'SELF', value, originalValue: value, startedAt: now, expiresAt: duration ? now + duration * 1000 : null, durationSeconds: duration, chargesRemaining: options.charges ?? null, maxCharges: options.charges ?? null, sourceItemId: options.sourceItemId ?? null, sourceType: options.sourceType ?? 'ITEM', stackId: type, stackCount: 1, maxStacks: definition.maxStacks, isActive: true, isPaused: false, pausedAt: null, metadata: options.metadata ?? {} };
    this.add(effect);
    analytics.trackItemEffectApplied(userId, options.sourceItemId ?? 'unknown', [type]);
    return { success: true, effectType: type, message: `Applied ${type}`, appliedEffects: [effect], failedEffects: [], conflicts };
  }

  getActiveBoost(userId: string, boostType: BoostEffectType): number { const effects = this.getByType(userId, boostType); return effects.length > 0 ? Math.max(...effects.map((effect) => effect.value)) : 0; }
  getMultiplier(userId: string, type: 'XP' | 'COINS' | 'DAMAGE' | 'DEFENSE'): number { const boostMap: Record<'XP' | 'COINS' | 'DAMAGE' | 'DEFENSE', BoostEffectType> = { XP: 'BOOST_XP', COINS: 'BOOST_COINS', DAMAGE: 'BOOST_DAMAGE', DEFENSE: 'BOOST_DEFENSE' }; return 1 + this.getActiveBoost(userId, boostMap[type]) / 100; }
  hasCharges(userId: string, type: 'SHIELD' | 'STREAK_PROTECTION'): boolean { return this.getByType(userId, type).some((effect) => effect.isActive && (effect.chargesRemaining === null || effect.chargesRemaining > 0)); }

  consumeCharge(userId: string, type: 'SHIELD' | 'STREAK_PROTECTION'): boolean {
    for (const effect of this.getByType(userId, type)) {
      if (!effect.isActive || effect.chargesRemaining === null || effect.chargesRemaining <= 0) {continue;}
      const chargesRemaining = effect.chargesRemaining - 1;
      chargesRemaining <= 0 ? this.remove(effect.id) : this.update(effect.id, { chargesRemaining });
      return true;
    }
    return false;
  }

  private cleanupExpired(): void {
    let removed = 0;
    for (const [id, effect] of this.effects) {if (effect.expiresAt !== null && effect.expiresAt <= Date.now() && !effect.isPaused) { this.remove(id); removed += 1; }}
    if (removed > 0) {debug.info('Cleaned up %d expired effects', removed);}
  }

  pauseEffects(userId: string, _reason: string): void { const now = Date.now(); for (const effect of this.getByUser(userId)) {if (effect.category === 'DURATION' && !effect.isPaused) {this.update(effect.id, { isPaused: true, pausedAt: now });}} }
  resumeEffects(userId: string): void { const now = Date.now(); for (const effect of this.getByUser(userId)) {if (effect.isPaused && effect.pausedAt) {this.update(effect.id, { isPaused: false, pausedAt: null, expiresAt: effect.expiresAt ? effect.expiresAt + (now - effect.pausedAt) : null });}} }

  getStats(userId: string): { total: number; byType: Record<string, number>; byCategory: Record<string, number> } {
    const effects = this.getByUser(userId);
    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    for (const effect of effects) { byType[effect.type] = (byType[effect.type] ?? 0) + 1; byCategory[effect.category] = (byCategory[effect.category] ?? 0) + 1; }
    return { total: effects.length, byType, byCategory };
  }
}

export const effectStore = new EffectStore();
export async function applyImmediateEffect(userId: string, type: EffectType, value: number, sourceItemId?: string): Promise<EffectResult> { if (EFFECT_DEFINITIONS[type].category !== 'IMMEDIATE') {return { success: false, effectType: type, message: `Use applyDurationEffect for ${type}`, appliedEffects: [], failedEffects: [{ type, reason: 'Wrong effect category' }], conflicts: [] };} analytics.trackItemEffectApplied(userId, sourceItemId ?? 'unknown', [type]); return { success: true, effectType: type, message: `Applied ${type} (${value})`, appliedEffects: [], failedEffects: [], conflicts: [] }; }
export async function applyDurationEffect(userId: string, type: EffectType, value: number, durationSeconds: number, sourceItemId?: string): Promise<EffectResult> { return effectStore.applyEffect(userId, type, value, { sourceItemId, sourceType: 'ITEM', duration: durationSeconds }); }
export async function applyChargeEffect(userId: string, type: EffectType, charges: number, sourceItemId?: string): Promise<EffectResult> { if (EFFECT_DEFINITIONS[type].category !== 'CHARGE') {return { success: false, effectType: type, message: `Use applyDurationEffect for ${type}`, appliedEffects: [], failedEffects: [{ type, reason: 'Wrong effect category' }], conflicts: [] };} return effectStore.applyEffect(userId, type, 0, { sourceItemId, sourceType: 'ITEM', charges }); }
export function getEffectMultiplier(userId: string, type: 'XP' | 'COINS' | 'DAMAGE'): number { return effectStore.getMultiplier(userId, type); }
export function hasActiveEffect(userId: string, type: EffectType): boolean { return effectStore.getByType(userId, type).length > 0; }
export function hasShield(userId: string): boolean { return effectStore.hasCharges(userId, 'SHIELD'); }
export function useShieldCharge(userId: string): boolean { return effectStore.consumeCharge(userId, 'SHIELD'); }
export function hasStreakProtection(userId: string): boolean { return effectStore.hasCharges(userId, 'STREAK_PROTECTION'); }
export function useStreakProtection(userId: string): boolean { return effectStore.consumeCharge(userId, 'STREAK_PROTECTION'); }
