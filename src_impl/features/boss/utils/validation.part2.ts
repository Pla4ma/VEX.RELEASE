import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";


export const BossValidation = {
  validateBossAttack,
  analyzeBossBalance,
  validateBossDefeat,
  BossAttackSchema,
};