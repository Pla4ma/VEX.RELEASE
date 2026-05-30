import { SessionMode } from "../../../session/modes";
import * as repository from "../repository";
import { getBestPreview } from "../service";

jest.mock("../repository");

const userId = "123e4567-e89b-12d3-a456-426614174000";

function makeBest(overrides: Record<string, unknown> = {}) {
  return {
    id: "123e4567-e89b-12d3-a456-426614174111",
    userId,
    sessionMode: SessionMode.SPRINT,
    durationBucket: "15" as const,
    bestPurityScore: 82,
    bestGrade: "B" as const,
    totalSessions: 3,
    achievedAt: "2026-05-14T12:00:00.000Z",
    updatedAt: "2026-05-14T12:00:00.000Z",
    ...overrides,
  };
}

describe("getBestPreview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a personal best when one exists", async () => {
    const best = makeBest();
    jest.mocked(repository.getPersonalBest).mockResolvedValue(best);

    const result = await getBestPreview(userId, SessionMode.SPRINT, 900);
    expect(result).toEqual(best);
  });

  it("returns null when no best exists", async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(null);

    const result = await getBestPreview(userId, SessionMode.SPRINT, 900);
    expect(result).toBeNull();
  });

  it("correctly resolves duration bucket for query", async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(null);

    await getBestPreview(userId, SessionMode.DEEP_WORK, 3600);
    expect(repository.getPersonalBest).toHaveBeenCalledWith(
      userId,
      SessionMode.DEEP_WORK,
      "60+",
    );
  });
});
