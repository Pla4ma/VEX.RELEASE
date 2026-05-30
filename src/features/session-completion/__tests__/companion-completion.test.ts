// Helper must be imported FIRST so its jest.mock() calls register before source modules load
import { resetCompletionMocks } from "./completion-product-journey-helpers";
import { applyCompletionSubsystems } from "../completion-subsystems";
import {
  createCompletionLedger,
  createSessionSummary,
} from "./ledger-test-utils";

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
