import type { SessionSummary } from "../../session/types";
import type { CompletionLedger } from "./schemas";
import {
  SUBSYSTEM_META,
  type SubsystemMeta,
  type SubsystemKind,
} from "./subsystem-meta";

export type CompletionSubsystemInput = {
  ledger: CompletionLedger;
  summary: SessionSummary;
};

export type CompletionSubsystemResult = {
  degradedSystems: string[];
  ledger: CompletionLedger;
};

export { SUBSYSTEM_META };
export type { SubsystemKind, SubsystemMeta };
