/**
 * Tests for addMemoryFromRecall service
 */
import { addMemoryFromRecall } from "../service";

const mockStore = new Map<string, string>();

jest.mock("react-native-mmkv", () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }
    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }
    delete(key: string): void {
      mockStore.delete(key);
    }
    contains(key: string): boolean {
      return mockStore.has(key);
    }
    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

const userId = "test-user-mc";

describe("addMemoryFromRecall", () => {
  afterEach(() => {
    mockStore.clear();
  });

  it("includes hint when provided", async () => {
    const mc = await addMemoryFromRecall({
      prompt: "What is photosynthesis?",
      answerHint: "Light energy conversion",
      recallId: "recall-1",
      userId,
    });
    expect(mc).not.toBeNull();
    expect(mc!.content).toContain("photosynthesis");
    expect(mc!.content).toContain("Light energy conversion");
    expect(mc!.source).toBe("recall");
  });

  it("omits hint section when answerHint is null", async () => {
    const mc = await addMemoryFromRecall({
      prompt: "What is DNA?",
      answerHint: null,
      recallId: "recall-2",
      userId,
    });
    expect(mc!.content).not.toContain("Hint:");
    expect(mc!.content).toContain("DNA");
  });
});
