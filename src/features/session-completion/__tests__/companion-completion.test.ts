import { applyCompletionSubsystems } from "../completion-subsystems";
import {
  createCompletionLedger,
  createSessionSummary,
} from "./ledger-test-utils";
import { resetCompletionMocks } from "./completion-product-journey-helpers";

describe("companion completion once", () => {
  beforeEach(() => {
    resetCompletionMocks();
  });

  it("companion completeSession called once per completion", async () => {
    const ledger = createCompletionLedger();
    const summary = createSessionSummary();

    await applyCompletionSubsystems({ ledger, summary });

    const { getCompanionService } = require("../../companion/service");
    const companionService = getCompanionService();
    expect(companionService.completeSession).toHaveBeenCalledTimes(1);
  });
});
