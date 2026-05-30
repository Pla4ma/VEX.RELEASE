/**
 * Tests for addMemoryFromStudyBlock service
 */
import { addMemoryFromStudyBlock } from "../service";

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

describe("addMemoryFromStudyBlock", () => {
  afterEach(() => {
    mockStore.clear();
  });

  it("formats content from title and objective", async () => {
    const mc = await addMemoryFromStudyBlock({
      blockTitle: "Cell Biology",
      blockObjective: "Understand mitosis",
      studyBlockId: "block-1",
      userId,
    });
    expect(mc).not.toBeNull();
    expect(mc!.content).toContain("Cell Biology");
    expect(mc!.content).toContain("Understand mitosis");
    expect(mc!.source).toBe("study_block");
    expect(mc!.sourceId).toBe("block-1");
  });

  it("truncates content to 2000 chars", async () => {
    const longTitle = "A".repeat(1500);
    const longObj = "B".repeat(1500);
    const mc = await addMemoryFromStudyBlock({
      blockTitle: longTitle,
      blockObjective: longObj,
      studyBlockId: "block-long",
      userId,
    });
    expect(mc!.content.length).toBeLessThanOrEqual(2000);
  });
});
