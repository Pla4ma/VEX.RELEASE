import * as Sentry from "@sentry/react-native";
import { getSupabaseClient } from "../../config/supabase";
import type { AddXpInput } from "./schemas";

export interface AtomicXpRpcResult {
  success: boolean;
  duplicate: boolean;
  xp_added: number;
  new_total_xp: number;
  new_level: number;
  previous_level: number;
  level_up: boolean;
  rewards: string[];
}

export async function tryAtomicAddXp(
  userId: string,
  amount: number,
  input: AddXpInput,
  idempotencyKey: string | undefined,
): Promise<AtomicXpRpcResult | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc("atomic_add_xp", {
      p_user_id: userId,
      p_amount: amount,
      p_source: input.source,
      p_session_id: input.sessionId ?? null,
      p_idempotency_key: idempotencyKey ?? null,
      p_metadata: input.metadata
        ? JSON.parse(JSON.stringify(input.metadata))
        : null,
    });

    if (error) {
      Sentry.captureException(error, {
        tags: { operation: "atomic_add_xp_rpc" },
      });
      return null;
    }

    return data as unknown as AtomicXpRpcResult;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "tryAtomicAddXp" },
    });
    return null;
  }
}
