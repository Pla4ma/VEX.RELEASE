import {
  appendFocusScoreHistory,
  fetchCurrentFocusScore,
  fetchFocusScoreHistory,
  fetchMonthlyFocusReportInput,
  upsertCurrentFocusScore,
} from "../repository-focus-score";

let mockSupabaseClient: unknown;

jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

const userId = "123e4567-e89b-12d3-a456-426614174000";
const factors = {
  consistency: {
    weightPercent: 35,
    score: 80,
    delta: 4,
    explanation: "Consistent completions.",
  },
  streakStability: {
    weightPercent: 25,
    score: 70,
    delta: 2,
    explanation: "Steady streak.",
  },
  sessionQuality: {
    weightPercent: 20,
    score: 85,
    delta: 5,
    explanation: "High-quality sessions.",
  },
  intentionalDifficulty: {
    weightPercent: 10,
    score: 60,
    delta: 1,
    explanation: "Moderate challenge.",
  },
  recency: {
    weightPercent: 10,
    score: 75,
    delta: 3,
    explanation: "Recent activity.",
  },
} as const;

const currentRow = {
  id: "123e4567-e89b-12d3-a456-426614174001",
  user_id: userId,
  current_score: 620,
  previous_score: 611,
  band: "Strong",
  factors,
  last_change_reason: "Session completed",
  created_at: "2026-05-06T00:00:00.000Z",
  updated_at: "2026-05-06T01:00:00.000Z",
};

function makeQuery(response: unknown): Record<string, jest.Mock> {
  const query: Record<string, jest.Mock> = {};
  query.select = jest.fn(() => query);
  query.eq = jest.fn(() => query);
  query.gte = jest.fn(() => query);
  query.lt = jest.fn(() => query);
  query.order = jest.fn(() => response);
  query.single = jest.fn(() => response);
  query.upsert = jest.fn(() => query);
  query.insert = jest.fn(() => query);
  return query;
}

function makeLtQuery(response: unknown): Record<string, jest.Mock> {
  const query = makeQuery(response);
  query.lt = jest.fn(() => response);
  return query;
}

function useQueries(...queries: Array<Record<string, jest.Mock>>): jest.Mock {
  const from = jest.fn();
  queries.forEach((query) => from.mockReturnValueOnce(query));
  mockSupabaseClient = { from };
  return from;
}

describe("focus identity repository (P2-02)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = undefined;
  });

  it("fetchCurrentFocusScore returns parsed score record on success", async () => {
    useQueries(makeQuery({ data: currentRow, error: null }));
    await expect(fetchCurrentFocusScore(userId)).resolves.toMatchObject({
      userId,
      currentScore: 620,
      band: "Strong",
    });
  });

  it("fetchCurrentFocusScore returns null when the user has no score", async () => {
    useQueries(
      makeQuery({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      }),
    );
    await expect(fetchCurrentFocusScore(userId)).resolves.toBeNull();
  });

  it("fetchCurrentFocusScore throws typed repository error on Supabase error", async () => {
    useQueries(
      makeQuery({
        data: null,
        error: { code: "500", message: "db unavailable" },
      }),
    );
    await expect(fetchCurrentFocusScore(userId)).rejects.toThrow(
      "fetchCurrentFocusScore",
    );
  });

  it("fetchCurrentFocusScore rejects invalid response shape", async () => {
    useQueries(
      makeQuery({ data: { ...currentRow, id: "invalid" }, error: null }),
    );
    await expect(fetchCurrentFocusScore(userId)).rejects.toThrow();
  });

  it("upsertCurrentFocusScore returns parsed score record on success", async () => {
    useQueries(
      makeQuery({
        data: { ...currentRow, current_score: 631, previous_score: 620 },
        error: null,
      }),
    );
    await expect(
      upsertCurrentFocusScore(userId, {
        currentScore: 631,
        previousScore: 620,
        band: "Strong",
        factors,
        lastChangeReason: "Session completed",
      }),
    ).resolves.toMatchObject({ currentScore: 631, previousScore: 620 });
  });

  it("upsertCurrentFocusScore resolves conflict by returning existing score", async () => {
    useQueries(
      makeQuery({ data: null, error: { code: "23505", message: "conflict" } }),
      makeQuery({
        data: { ...currentRow, current_score: 630, previous_score: 620 },
        error: null,
      }),
    );
    await expect(
      upsertCurrentFocusScore(userId, {
        currentScore: 631,
        previousScore: 620,
        band: "Strong",
        factors,
        lastChangeReason: "Session completed",
      }),
    ).resolves.toMatchObject({ currentScore: 630 });
  });

  it("appendFocusScoreHistory returns parsed history point on success", async () => {
    useQueries(
      makeQuery({
        data: {
          user_id: userId,
          occurred_at: "2026-05-06T02:00:00.000Z",
          score: 630,
          delta: 10,
          reason: "Session completed",
        },
        error: null,
      }),
    );
    await expect(
      appendFocusScoreHistory({
        userId,
        timestamp: "2026-05-06T02:00:00.000Z",
        score: 630,
        delta: 10,
        reason: "Session completed",
      }),
    ).resolves.toMatchObject({ score: 630, delta: 10 });
  });

  it("appendFocusScoreHistory throws typed repository error on Supabase error", async () => {
    useQueries(makeQuery({ data: null, error: { message: "insert failed" } }));
    await expect(
      appendFocusScoreHistory({
        userId,
        timestamp: "2026-05-06T02:00:00.000Z",
        score: 630,
        delta: 10,
        reason: "Session completed",
      }),
    ).rejects.toThrow("appendFocusScoreHistory");
  });

  it("fetchFocusScoreHistory returns empty and parsed history arrays", async () => {
    useQueries(
      makeQuery({
        data: [
          {
            user_id: userId,
            occurred_at: "2026-05-06T02:00:00.000Z",
            score: 630,
            delta: 10,
            reason: "Session completed",
          },
        ],
        error: null,
      }),
    );
    await expect(fetchFocusScoreHistory(userId, 30)).resolves.toEqual([
      {
        timestamp: "2026-05-06T02:00:00.000Z",
        score: 630,
        delta: 10,
        reason: "Session completed",
      },
    ]);

    useQueries(makeQuery({ data: [], error: null }));
    await expect(fetchFocusScoreHistory(userId, 30)).resolves.toEqual([]);
  });

  it("fetchMonthlyFocusReportInput returns month-scoped aggregate data", async () => {
    useQueries(
      makeQuery({
        data: [
          {
            user_id: userId,
            occurred_at: "2026-05-06T02:00:00.000Z",
            score: 630,
            delta: 10,
            reason: "Session completed",
          },
        ],
        error: null,
      }),
      makeLtQuery({
        data: [
          {
            duration: 1800,
            effective_duration: 1500,
            quality_score: 88,
            status: "completed",
            completed_at: "2026-05-05T00:00:00.000Z",
          },
        ],
        error: null,
      }),
    );
    await expect(
      fetchMonthlyFocusReportInput(userId, "2026-05"),
    ).resolves.toMatchObject({
      userId,
      month: "2026-05",
      sessionsCompleted: 1,
      totalFocusedMinutes: 25,
      bestGrade: "A",
    });
  });

  it("fetchMonthlyFocusReportInput throws on invalid month and Supabase error", async () => {
    await expect(
      fetchMonthlyFocusReportInput(userId, "2026-5"),
    ).rejects.toThrow();

    useQueries(makeQuery({ data: null, error: { message: "history failed" } }));
    await expect(
      fetchMonthlyFocusReportInput(userId, "2026-05"),
    ).rejects.toThrow("history");
  });
});
