import { z } from "zod";
import { SessionModeSchema, type SessionMode } from "../../session/modes";
import { SessionCompletionGradeSchema } from "../session-completion/schemas";
import { PersonalBestComparisonSchema } from "./schemas";
import * as repository from "./repository";
import type {
  DurationBucket,
  PersonalBest,
  PersonalBestComparison,
} from "./types";

const UserIdSchema = z.string().uuid();
const DurationSecondsSchema = z.number().int().min(0);
const PurityScoreSchema = z.number().min(0).max(100);

export function getDurationBucket(durationSeconds: number): DurationBucket {
  const seconds = DurationSecondsSchema.parse(durationSeconds);
  if (seconds < 750) {
    return "10";
  }
  if (seconds < 1200) {
    return "15";
  }
  if (seconds < 2100) {
    return "25";
  }
  if (seconds < 3300) {
    return "45";
  }
  return "60+";
}

export async function checkAndUpdatePersonalBest(
  userId: string,
  mode: SessionMode,
  durationSeconds: number,
  purityScore: number,
  grade: z.infer<typeof SessionCompletionGradeSchema>,
): Promise<PersonalBestComparison> {
  const parsedUserId = UserIdSchema.parse(userId);
  const parsedMode = SessionModeSchema.parse(mode);
  const bucket = getDurationBucket(durationSeconds);
  const parsedPurity = PurityScoreSchema.parse(purityScore);
  const parsedGrade = SessionCompletionGradeSchema.parse(grade);
  const current = await repository.getPersonalBest(
    parsedUserId,
    parsedMode,
    bucket,
  );
  if (current && parsedPurity <= current.bestPurityScore) {
    return PersonalBestComparisonSchema.parse({
      current,
      isNewRecord: false,
      previousBest: current.bestPurityScore,
      margin: null,
    });
  }
  const updated = await repository.upsertPersonalBest({
    userId: parsedUserId,
    sessionMode: parsedMode,
    durationBucket: bucket,
    bestPurityScore: parsedPurity,
    bestGrade: parsedGrade,
  });
  return PersonalBestComparisonSchema.parse({
    current: updated,
    isNewRecord: true,
    previousBest: current?.bestPurityScore ?? null,
    margin: current ? parsedPurity - current.bestPurityScore : null,
  });
}

export async function getBestPreview(
  userId: string,
  mode: SessionMode,
  durationSeconds: number,
): Promise<PersonalBest | null> {
  return repository.getPersonalBest(
    UserIdSchema.parse(userId),
    SessionModeSchema.parse(mode),
    getDurationBucket(durationSeconds),
  );
}

export async function getUserPersonalBests(
  userId: string,
): Promise<PersonalBest[]> {
  return repository.getUserPersonalBests(UserIdSchema.parse(userId));
}
