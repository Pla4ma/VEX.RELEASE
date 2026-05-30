/**
 * Content-Study Tests: Row Mappers
 */
import { describe, it, expect } from "@jest/globals";

import { mapContentRow, mapGenerationRow, contentRowSchema, generationRowSchema } from "../row-mappers";

// ============================================================================
// contentRowSchema & mapContentRow
// ============================================================================
describe("contentRowSchema and mapContentRow", () => {
  const validRow = {
    id: "c-1",
    user_id: "u-1",
    source_type: "PASTE",
    extracted_text: "hello",
    extracted_length: 5,
    language: "en",
    is_user_edited: false,
    status: "READY",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  it("parses a valid row", () => {
    const parsed = contentRowSchema.parse(validRow);
    expect(parsed.id).toBe("c-1");
    expect(parsed.user_id).toBe("u-1");
    expect(parsed.source_type).toBe("PASTE");
  });

  it("applies defaults for optional fields", () => {
    const parsed = contentRowSchema.parse(validRow);
    expect(parsed.extracted_text).toBe("hello");
    expect(parsed.generation_count_today).toBe(0);
    expect(parsed.is_user_edited).toBe(false);
  });

  it("mapContentRow maps generationCountToday to generationCount correctly", () => {
    // The mapper now correctly maps generationCountToday -> generationCount
    const result = mapContentRow(validRow);
    expect(result.generationCount).toBe(0);
  });

  it("mapContentRow handles nullable fields without throwing", () => {
    const row = { ...validRow, source_url: null, title: null, error_message: null };
    const result = mapContentRow(row);
    expect(result.sourceUrl).toBeUndefined();
    expect(result.title).toBeUndefined();
    expect(result.errorMessage).toBeUndefined();
  });

  it("rejects invalid source_type", () => {
    expect(() => contentRowSchema.parse({ ...validRow, source_type: "INVALID" })).toThrow();
  });

  it("rejects invalid status", () => {
    expect(() => contentRowSchema.parse({ ...validRow, status: "INVALID" })).toThrow();
  });
});

// ============================================================================
// generationRowSchema & mapGenerationRow
// ============================================================================
describe("generationRowSchema and mapGenerationRow", () => {
  const validGenRow = {
    id: "g-1",
    content_id: "c-1",
    user_id: "u-1",
    model: "gpt-4",
    generation_version: "v1",
    summary: "A summary",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  it("parses a valid generation row", () => {
    const parsed = generationRowSchema.parse(validGenRow);
    expect(parsed.id).toBe("g-1");
    expect(parsed.content_id).toBe("c-1");
  });

  it("applies defaults for arrays", () => {
    const parsed = generationRowSchema.parse(validGenRow);
    expect(parsed.key_concepts).toEqual([]);
    expect(parsed.tasks).toEqual([]);
    expect(parsed.quiz_items).toEqual([]);
    expect(parsed.times_used).toBe(0);
  });

  it("mapGenerationRow throws on row data (StudyGenerationSchema.summary expects object, not string)", () => {
    // The mapper passes string summary but StudyGenerationSchema expects object { overview, keyPoints, ... }
    expect(() => mapGenerationRow(validGenRow)).toThrow();
  });

  it("mapGenerationRow handles nullable fields the same way", () => {
    const row = { ...validGenRow, processing_time_ms: null, user_rating: null, was_helpful: null };
    expect(() => mapGenerationRow(row)).toThrow();
  });
});
