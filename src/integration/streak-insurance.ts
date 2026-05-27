import { z } from "zod";
import { createDebugger } from "../utils/debug";

const debug = createDebugger("integration:streak-insurance-archived");

const StreakBrokenEventSchema = z.object({
  userId: z.string(),
  previousStreak: z.number().int().min(0),
});

let cleanupSubscription: (() => void) | null = null;

/**
 * NO-OP — Streak insurance archived.
 * consumeInsurance always returns false. No economy dependency.
 */
export function initializeStreakInsuranceIntegration(): () => void {
  if (cleanupSubscription) {
    return cleanupSubscription;
  }
  cleanupSubscription = () => {};
  debug.info("Streak insurance no-op — economy systems archived");
  return () => {
    cleanupSubscription?.();
    cleanupSubscription = null;
  };
}
