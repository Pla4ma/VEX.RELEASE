import { buildCompletionReflection } from "../completion-reflection-service";
import { buildPostSessionStoryViewModel } from "../story-view-model-service";
import {
  createCompletionLedger,
  createSessionSummary,
} from "./ledger-test-utils";

describe("CompletionReflectionService", () => {
  it("builds fast deterministic reflection and next action", () => {
    const summary = createSessionSummary({ interruptions: 0, pauses: 0 });

    const reflection = buildCompletionReflection({
      motivationStyle: "coach_led",
      primaryGoal: "WORK",
      sessionSummary: summary,
      streakDays: 4,
    });

    expect(reflection.tone).toBe("coach");
    expect(reflection.reflection).toContain("protected");
    expect(reflection.nextAction).toContain("Next:");
  });

  it("normal completion view model uses CompletionReflectionService", () => {
    const summary = createSessionSummary({
      effectiveDuration: 1200,
      interruptions: 0,
      pauses: 0,
    });
    const reflection = buildCompletionReflection({
      progressLabel: "+8 Focus Score",
      sessionSummary: summary,
      streakDays: 4,
    });

    const viewModel = buildPostSessionStoryViewModel({
      degradedWarnings: [],
      ledger: createCompletionLedger(),
      summary,
    });

    expect(viewModel.beats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "meaning", body: reflection.reflection }),
        expect.objectContaining({
          id: "tomorrow",
          body: reflection.nextAction,
        }),
      ]),
    );
  });

  it("completion still shows a personal reflection", () => {
    const viewModel = buildPostSessionStoryViewModel({
      degradedWarnings: [],
      ledger: createCompletionLedger({
        streakResult: { action: "extended", newDays: 5, previousDays: 4 },
      }),
      summary: createSessionSummary(),
    });

    const meaning = viewModel.beats.find((beat) => beat.id === "meaning");

    expect(meaning?.body).toMatch(/protected|chain|finished|early rep/);
  });
});
