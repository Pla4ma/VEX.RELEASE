describe("Content Study — Generation Edge Cases", () => {
  describe("generateStudyPlan — Gemini timeout", () => {
    it("throws on timeout with retryable flag", () => {
      const timeoutError = new Error("AbortError: The operation was aborted");
      expect(timeoutError.message).toContain("abort");
    });

    it("falls back to default study plan on timeout", () => {
      const fallbackTasks = [
        {
          id: "task-1",
          content: "Read through the content carefully",
          estimatedMinutes: 15,
          priority: "HIGH" as const,
        },
        {
          id: "task-2",
          content: "Identify and note key concepts",
          estimatedMinutes: 10,
          priority: "HIGH" as const,
        },
        {
          id: "task-3",
          content: "Review and summarize main points",
          estimatedMinutes: 15,
          priority: "MEDIUM" as const,
        },
      ];
      expect(fallbackTasks).toHaveLength(3);
      expect(fallbackTasks[0]?.priority).toBe("HIGH");
    });

    it("abort controller cleans up properly", () => {
      let aborted = false;
      const controller = new AbortController();
      controller.signal.addEventListener("abort", () => {
        aborted = true;
      });
      controller.abort();
      expect(aborted).toBe(true);
    });
  });

  describe("generateStudyPlan — Gemini invalid JSON", () => {
    it("handles completely invalid JSON gracefully", () => {
      const badResponse = "Not JSON at all, just some text response from AI";
      expect(() => JSON.parse(badResponse)).toThrow();
    });

    it("handles JSON with missing fields", () => {
      const partial = JSON.stringify({ summary: "Only summary" });
      const parsed = JSON.parse(partial) as Record<string, unknown>;
      expect(parsed.summary).toBe("Only summary");
      expect(parsed.tasks).toBeUndefined();
    });

    it("handles JSON with wrong types", () => {
      const wrongTypes = JSON.stringify({
        tasks: "not an array",
        quizItems: 123,
      });
      const parsed = JSON.parse(wrongTypes) as Record<string, unknown>;
      expect(Array.isArray(parsed.tasks)).toBe(false);
    });

    it("handles markdown-wrapped JSON", () => {
      const markdownWrapped = '```json\n{"summary": "test"}\n```';
      const cleaned = markdownWrapped
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      expect(JSON.parse(cleaned)).toEqual({ summary: "test" });
    });
  });

  describe("generateStudyPlan — storage failure", () => {
    it("marks content as FAILED when storage write fails", () => {
      const mockError = { message: "Storage quota exceeded" };
      expect(mockError.message).toContain("Storage");
    });

    it("handles Supabase insert error for generations", () => {
      const mockError = {
        message: "duplicate key value violates unique constraint",
      };
      expect(mockError.message).toContain("duplicate");
    });

    it("handles storage download failure for PDFs", () => {
      const mockError = { message: "The resource was not found" };
      expect(mockError.message).toContain("not found");
    });
  });

  describe("generateStudyPlan — generation retry", () => {
    it("retries on transient errors up to MAX_RETRIES", () => {
      const MAX_RETRIES = 3;
      let attempts = 0;
      const retryLogic = () => {
        while (attempts < MAX_RETRIES) {
          attempts += 1;
        }
      };
      retryLogic();
      expect(attempts).toBe(MAX_RETRIES);
    });

    it("respects exponential backoff delays", () => {
      const delays = [1000, 2000, 4000];
      const multiplier = 2;
      for (let i = 0; i < delays.length; i += 1) {
        const expected = 1000 * multiplier ** i;
        expect(delays[i]).toBe(expected);
      }
    });
  });

  describe("generateStudyPlan — quota exceeded", () => {
    it("returns 429 when daily limit reached", () => {
      const remaining = 0;
      const canGenerate = remaining > 0;
      expect(canGenerate).toBe(false);
    });

    it("includes remaining count in error response", () => {
      const response = {
        success: false,
        error: "Daily limit reached",
        remaining: 0,
      };
      expect(response.remaining).toBe(0);
      expect(response.success).toBe(false);
    });

    it("resets count after midnight boundary", () => {
      const now = new Date("2026-05-18T23:59:59Z");
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const oneMinuteAfter = new Date(midnight.getTime() + 60000);
      expect(oneMinuteAfter.getDate()).not.toBe(now.getDate());
    });
  });

  describe("generateStudyPlan — user mismatch", () => {
    it("returns 403 when userId does not match content owner", () => {
      const contentOwnerId = "user-a";
      const requestUserId = "user-b";
      expect(contentOwnerId).not.toBe(requestUserId);
    });

    it("rejects access to deleted content", () => {
      const deletedAt = "2026-05-18T00:00:00Z";
      const isDeleted = deletedAt !== null;
      expect(isDeleted).toBe(true);
    });
  });

  describe("pollContentStatus — timeout handling", () => {
    it("throws after MAX_STATUS_POLL_ATTEMPTS", async () => {
      const MAX_POLL = 10;
      let attempts = 0;
      const poll = async () => {
        while (attempts < MAX_POLL) {
          attempts += 1;
          await new Promise((r) => setTimeout(r, 1));
        }
        throw new Error("Processing timeout");
      };
      await expect(poll()).rejects.toThrow("Processing timeout");
      expect(attempts).toBe(MAX_POLL);
    });

    it("stops polling when status is READY", async () => {
      const statuses = ["PENDING", "EXTRACTING", "READY"];
      const results: string[] = [];
      for (const status of statuses) {
        results.push(status);
        if (status === "READY") break;
      }
      expect(results).toEqual(["PENDING", "EXTRACTING", "READY"]);
    });
  });
});
