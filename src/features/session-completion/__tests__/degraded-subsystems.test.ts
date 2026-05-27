import { applyCompletionSubsystems } from "../completion-subsystems";
import {
  createCompletionLedger,
  createSessionSummary,
} from "./ledger-test-utils";
import { resetCompletionMocks } from "./completion-product-journey-helpers";

describe("degraded subsystems are tracked", () => {
  beforeEach(() => {
    resetCompletionMocks();
  });

  it("no degraded systems for normal completion", async () => {
    const ledger = createCompletionLedger();
    const summary = createSessionSummary();

    const result = await applyCompletionSubsystems({ ledger, summary });

    expect(result.degradedSystems).toEqual([]);
  });
});
