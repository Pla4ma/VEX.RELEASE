import { isSensitiveMemoryType, scopeMemoryForContext } from "../CoachMemory";
import { makeMemory } from "./trust-hardening-boundary-helpers";

describe("Sensitive content scoping", () => {
  it("isSensitiveMemoryType identifies sensitive types", () => {
    expect(isSensitiveMemoryType("DOCUMENT_MILESTONE")).toBe(true);
    expect(isSensitiveMemoryType("STUDY_PATTERN")).toBe(true);
    expect(isSensitiveMemoryType("FIRST_S_GRADE")).toBe(false);
    expect(isSensitiveMemoryType("BEST_STREAK")).toBe(false);
  });

  it("scopeMemoryForContext allows task_specific context for all memories", () => {
    const memory = makeMemory({
      type: "DOCUMENT_MILESTONE",
      metadata: { source: "import" },
    });
    const result = scopeMemoryForContext(memory, "task_specific");
    expect(result.usable).toBe(true);
  });

  it("scopeMemoryForContext blocks import-sourced sensitive memories from generic_coach", () => {
    const memory = makeMemory({
      type: "DOCUMENT_MILESTONE",
      metadata: { source: "import" },
    });
    const result = scopeMemoryForContext(memory, "generic_coach");
    expect(result.usable).toBe(false);
  });

  it("scopeMemoryForContext allows non-sensitive memories in generic_coach", () => {
    const memory = makeMemory({ type: "FIRST_S_GRADE" });
    const result = scopeMemoryForContext(memory, "generic_coach");
    expect(result.usable).toBe(true);
  });

  it("scopeMemoryForContext allows sensitive memories from non-import source", () => {
    const memory = makeMemory({
      type: "STUDY_PATTERN",
      source: "session_completion",
    } as Record<string, unknown>);
    const result = scopeMemoryForContext(memory, "generic_coach");
    expect(result.usable).toBe(true);
  });
});
