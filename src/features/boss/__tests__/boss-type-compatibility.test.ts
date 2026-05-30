import type {
  PersonalBlockerBlock,
  BlockerVisibility,
  BlockerCompletionSignal,
} from "../types";

describe("Type compatibility", () => {
  it("PersonalBlockerBlock type matches schema output", () => {
    const block: PersonalBlockerBlock = {
      id: "test",
      label: "Test",
      triggerAfterSessions: 1,
    };
    expect(block.id).toBe("test");
  });

  it("BlockerVisibility type accepts all expected values", () => {
    const visibilities: BlockerVisibility[] = [
      "hidden",
      "teaser",
      "subtle",
      "visible",
    ];
    expect(visibilities).toHaveLength(4);
  });

  it("BlockerCompletionSignal has the expected shape", () => {
    const signal: BlockerCompletionSignal = {
      blockerId: "b1",
      progressSaved: 0.5,
      resolved: true,
    };
    expect(signal.blockerId).toBe("b1");
    expect(signal.progressSaved).toBe(0.5);
    expect(signal.resolved).toBe(true);
  });
});
