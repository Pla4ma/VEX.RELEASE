/**
 * Chests Repository
 * Persistence for gacha chest system
 */

import { getSupabaseClient } from "../../config/supabase";
import { enqueue } from "../../lib/offline/queue";
import { withRetry, RepositoryError } from "../../lib/repository/base";
import { captureSilentFailure } from "../../utils/silent-failure";
import { z } from "zod";

const supabase = getSupabaseClient();

// ============================================================================
// Schemas
// ============================================================================

export const ChestSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"]),
  source: z.enum(["DAILY_REWARD", "BATTLE_PASS", "BOSS_DEFEAT", "SHOP_PURCHASE", "ACHIEVEMENT", "EVENT"]),
  opened: z.boolean().default(false),
  rewards: z
    .array(
      z.object({
        type: z.enum(["COINS", "GEMS", "XP_BOOST", "STREAK_SHIELD", "COSMETIC", "TITLE", "BOSS_RETRY"]),
        amount: z.number(),
        rarity: z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]),
      }),
    )
    .nullable(),
  created_at: z.number(),
  opened_at: z.number().nullable(),
});

export const MysteryMultiplierSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  multiplier: z.number().min(2).max(10),
  chance: z.number(),
  triggered: z.boolean(),
  session_id: z.string().uuid().nullable(),
  triggered_at: z.number().nullable(),
  expires_at: z.number().nullable(),
  used: z.boolean().default(false),
});

export type Chest = z.infer<typeof ChestSchema>;
export type MysteryMultiplier = z.infer<typeof MysteryMultiplierSchema>;

// ============================================================================
// Repository Functions
// ============================================================================

export async function createChest(chest: Omit<Chest, "opened" | "rewards" | "opened_at">): Promise<{ data: Chest | null; error: RepositoryError | null }> {
  try {
    enqueue({
      operation: "CREATE",
      feature: "rewards",
      payload: chest,
      idempotencyKey: `chest:create:${chest.user_id}:${chest.id}`,
      maxRetries: 5,
      priority: "high",
    });

    const { data, error } = await withRetry("createChest", async () => {
      return await supabase
        .from("chests")
        .insert({
          id: chest.id,
          user_id: chest.user_id,
          type: chest.type,
          source: chest.source,
          opened: false,
          rewards: null,
          created_at: chest.created_at,
          opened_at: null,
        })
        .select()
        .single();
    });

    if (error) {
      throw error;
    }
    return { data: ChestSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "create", type: "data" });
    return { data: null, error: new RepositoryError("createChest", error) };
  }
}

export async function openChest(chestId: string, rewards: NonNullable<Chest["rewards"]>): Promise<{ data: Chest | null; error: RepositoryError | null }> {
  try {
    enqueue({
      operation: "UPDATE",
      feature: "rewards",
      payload: { chestId, rewards },
      idempotencyKey: `chest:open:${chestId}:${Date.now()}`,
      maxRetries: 5,
      priority: "high",
    });

    const { data, error } = await withRetry("openChest", async () => {
      return await supabase
        .from("chests")
        .update({
          opened: true,
          rewards,
          opened_at: Date.now(),
        })
        .eq("id", chestId)
        .select()
        .single();
    });

    if (error) {
      throw error;
    }
    return { data: ChestSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "open", type: "data" });
    return { data: null, error: new RepositoryError("openChest", error) };
  }
}

export async function fetchUserChests(userId: string, opened: boolean | null = null): Promise<{ data: Chest[]; error: RepositoryError | null }> {
  try {
    let query = supabase.from("chests").select("*").eq("user_id", userId);

    if (opened !== null) {
      query = query.eq("opened", opened);
    }

    const { data, error } = await withRetry("fetchUserChests", async () => {
      return await query.order("created_at", { ascending: false });
    });

    if (error) {
      throw error;
    }
    return {
      data: (data || []).map((row) => ChestSchema.parse(row)),
      error: null,
    };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "fetch", type: "data" });
    return { data: [], error: new RepositoryError("fetchUserChests", error) };
  }
}

export async function fetchChestById(chestId: string): Promise<{ data: Chest | null; error: RepositoryError | null }> {
  try {
    const { data, error } = await withRetry("fetchChestById", async () => {
      return await supabase.from("chests").select("*").eq("id", chestId).single();
    });

    if (error) {
      if (error.code === "PGRST116") {
        return { data: null, error: null };
      }
      throw error;
    }

    return { data: ChestSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "fetchById", type: "data" });
    return { data: null, error: new RepositoryError("fetchChestById", error) };
  }
}

export async function createMysteryMultiplier(multiplier: Omit<MysteryMultiplier, "used">): Promise<{ data: MysteryMultiplier | null; error: RepositoryError | null }> {
  try {
    const { data, error } = await withRetry("createMysteryMultiplier", async () => {
      return await supabase
        .from("mystery_multipliers")
        .insert({
          id: multiplier.id,
          user_id: multiplier.user_id,
          multiplier: multiplier.multiplier,
          chance: multiplier.chance,
          triggered: multiplier.triggered,
          session_id: multiplier.session_id,
          triggered_at: multiplier.triggered_at,
          expires_at: multiplier.expires_at,
          used: false,
        })
        .select()
        .single();
    });

    if (error) {
      throw error;
    }
    return { data: MysteryMultiplierSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "createMultiplier", type: "data" });
    return { data: null, error: new RepositoryError("createMysteryMultiplier", error) };
  }
}

export async function markMultiplierUsed(multiplierId: string): Promise<{ success: boolean; error: RepositoryError | null }> {
  try {
    const { error } = await withRetry("markMultiplierUsed", async () => {
      return await supabase.from("mystery_multipliers").update({ used: true }).eq("id", multiplierId);
    });

    if (error) {
      throw error;
    }
    return { success: true, error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "markUsed", type: "data" });
    return { success: false, error: new RepositoryError("markMultiplierUsed", error) };
  }
}

export async function fetchActiveMultiplier(userId: string): Promise<{ data: MysteryMultiplier | null; error: RepositoryError | null }> {
  try {
    const { data, error } = await withRetry("fetchActiveMultiplier", async () => {
      return await supabase.from("mystery_multipliers").select("*").eq("user_id", userId).eq("triggered", true).eq("used", false).gt("expires_at", Date.now()).single();
    });

    if (error) {
      if (error.code === "PGRST116") {
        return { data: null, error: null };
      }
      throw error;
    }

    return { data: MysteryMultiplierSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "fetchMultiplier", type: "data" });
    return { data: null, error: new RepositoryError("fetchActiveMultiplier", error) };
  }
}

// ============================================================================
// Analytics
// ============================================================================

export async function fetchChestAnalytics(userId: string): Promise<{
  data: {
    totalOpened: number;
    byType: Record<string, number>;
    totalValue: { coins: number; gems: number };
  } | null;
  error: RepositoryError | null;
}> {
  try {
    const { data, error } = await withRetry("fetchChestAnalytics", async () => {
      return await supabase.rpc("get_chest_analytics", { p_user_id: userId });
    });

    if (error) {
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "analytics", type: "data" });
    return { data: null, error: new RepositoryError("fetchChestAnalytics", error) };
  }
}
