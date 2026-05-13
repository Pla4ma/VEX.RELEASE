import type { SessionState, RecoveryRecord, RecoveryType, InterruptionRecord } from "../types";
import { v4 as uuidv4 } from "../../utils/uuid";
import { createDebugger } from "../../utils/debug";


export function createRecoveryService(config?: Partial<RecoveryConfig>): RecoveryService {
  return new RecoveryService(config);
}

export function getRecoveryService(config?: Partial<RecoveryConfig>): RecoveryService {
  if (!serviceInstance) {
    serviceInstance = new RecoveryService(config);
  }
  return serviceInstance;
}