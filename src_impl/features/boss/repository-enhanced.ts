import { captureSilentFailure } from "../../utils/silent-failure";
/**
 * Enhanced Boss Repository
 * Features: Retry logic, offline queue integration
 */

import { withRetry, RepositoryError, RepositoryErrorCode } from "../../lib/repository/base";
import { enqueue } from "../../lib/offline/queue";
import { getSupabaseClient } from "../../config/supabase";
import { BossEncounterSchema, BossTemplateSchema, type BossEncounter, type BossTemplate } from "./schemas";

const supabase = getSupabaseClient();

// ============================================================================
// Enhanced Error Handling
// ============================================================================

export class BossRepositoryError extends RepositoryError {
  constructor(operation: string, error: unknown, code?: RepositoryErrorCode) {
    super(operation, error, code);
    this.name = "BossRepositoryError";
  }
}

// ============================================================================
// Connection-Aware Operations
// ============================================================================

interface RepositoryResult<T> {
  data: T | null;
  error: BossRepositoryError | null;
  fromCache: boolean;
}

async function executeWithFallback<T>(operation: string, onlineFn: () => Promise<T>, offlineFn?: () => Promise<T | null>): Promise<RepositoryResult<T>> {
  try {
    const data = await withRetry(operation, onlineFn);
    return { data, error: null, fromCache: false };
  } catch (error) {
    const repoError = error instanceof RepositoryError ? new BossRepositoryError(operation, error.originalError, error.code) : new BossRepositoryError(operation, error);

    if (offlineFn) {
      try {
        const cached = await offlineFn();
        if (cached) {
          return { data: cached, error: repoError, fromCache: true };
        }
      } catch (error) {
        captureSilentFailure(error, { feature: "boss", operation: "network-fallback", type: "network" });
        // Cache miss
      }
    }

    return { data: null, error: repoError, fromCache: false };
  }
}

// ============================================================================
// Enhanced Encounter Operations
// ============================================================================

export async function fetchActiveEncounterEnhanced(userId: string, squadId?: string): Promise<RepositoryResult<BossEncounter | null>> {
  return executeWithFallback("fetchActiveEncounter", async () => {
    let query = supabase.from("boss_encounters").select("*").eq("status", "ACTIVE");

    if (squadId) {
      query = query.eq("squad_id", squadId);
    } else {
      query = query.eq("user_id", userId).is("squad_id", null);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return BossEncounterSchema.parse(data);
  });
}

export async function createEncounterEnhanced(userId: string, bossId: string, maxHealth: number, squadId?: string): Promise<RepositoryResult<BossEncounter>> {
  const newEncounter = {
    id: crypto.randomUUID(),
    user_id: userId,
    squad_id: squadId || null,
    boss_id: bossId,
    health_remaining: maxHealth,
    max_health: maxHealth,
    damage_dealt: 0,
    status: "ACTIVE",
    created_at: Date.now(),
    expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  enqueue({
    operation: "CREATE",
    feature: "boss",
    payload: newEncounter,
    idempotencyKey: `boss:encounter:${userId}:${bossId}:${Date.now()}`,
    maxRetries: 5,
    priority: "high",
  });

  return executeWithFallback("createEncounter", async () => {
    const { data, error } = await supabase.from("boss_encounters").insert(newEncounter).select().single();

    if (error) {
      throw error;
    }
    return BossEncounterSchema.parse(data);
  });
}

export async function updateEncounterHealthEnhanced(encounterId: string, healthRemaining: number, damageDealt: number, sessionId: string): Promise<RepositoryResult<BossEncounter>> {
  enqueue({
    operation: "UPDATE",
    feature: "boss",
    payload: { encounterId, healthRemaining, damageDealt, sessionId },
    idempotencyKey: `boss:damage:${encounterId}:${sessionId}`,
    maxRetries: 5,
    priority: "high",
  });

  return executeWithFallback("updateEncounterHealth", async () => {
    const { data, error } = await supabase
      .from("boss_encounters")
      .update({
        health_remaining: healthRemaining,
        damage_dealt: damageDealt,
        updated_at: Date.now(),
      })
      .eq("id", encounterId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return BossEncounterSchema.parse(data);
  });
}

// ============================================================================
// Defeat Operations
// ============================================================================

export async function markEncounterDefeatedEnhanced(encounterId: string): Promise<RepositoryResult<BossEncounter>> {
  return executeWithFallback("markEncounterDefeated", async () => {
    const { data, error } = await supabase
      .from("boss_encounters")
      .update({
        status: "DEFEATED",
        defeated_at: Date.now(),
        updated_at: Date.now(),
      })
      .eq("id", encounterId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return BossEncounterSchema.parse(data);
  });
}

export async function recordBossDefeatEnhanced(userId: string, bossId: string, encounterId: string, damageDealt: number): Promise<RepositoryResult<{ id: string }>> {
  enqueue({
    operation: "CREATE",
    feature: "boss",
    payload: { userId, bossId, encounterId, damageDealt },
    idempotencyKey: `boss:defeat:${userId}:${encounterId}`,
    maxRetries: 5,
    priority: "high",
  });

  return executeWithFallback("recordBossDefeat", async () => {
    const { data, error } = await supabase
      .from("boss_defeat_history")
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        boss_id: bossId,
        encounter_id: encounterId,
        damage_dealt: damageDealt,
        defeated_at: Date.now(),
        created_at: Date.now(),
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }
    return data as { id: string };
  });
}

// ============================================================================
// Template Operations
// ============================================================================

export async function fetchBossTemplatesEnhanced(): Promise<RepositoryResult<BossTemplate[]>> {
  return executeWithFallback("fetchBossTemplates", async () => {
    const { data, error } = await supabase.from("boss_templates").select("*").order("unlock_level", { ascending: true });

    if (error) {
      throw error;
    }
    return BossTemplateSchema.array().parse(data || []);
  });
}

// ============================================================================
// Cooldown Operations
// ============================================================================

export async function getCooldownStatusEnhanced(userId: string, bossId: string): Promise<RepositoryResult<{ onCooldown: boolean; remainingMs: number }>> {
  return executeWithFallback("getCooldownStatus", async () => {
    const { data, error } = await supabase.from("boss_defeat_history").select("defeated_at").eq("user_id", userId).eq("boss_id", bossId).order("defeated_at", { ascending: false }).limit(1).single();

    if (error) {
      if (error.code === "PGRST116") {
        return { onCooldown: false, remainingMs: 0 };
      }
      throw error;
    }

    const defeatedAt = data.defeated_at as number;
    const cooldownMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    const remainingMs = Math.max(0, defeatedAt + cooldownMs - Date.now());

    return {
      onCooldown: remainingMs > 0,
      remainingMs,
    };
  });
}
