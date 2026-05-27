import { z } from "zod";

const completionToastSummarySchema = z.object({
  grade: z.string().optional(),
  interruptions: z.number().int().nonnegative().optional(),
  focusQuality: z.number().optional(),
});

export function buildToast(summary: unknown): {
  title: string;
  message: string;
} {
  const parsed = completionToastSummarySchema.safeParse(summary);
  if (!parsed.success)
    return { title: "Session complete.", message: "Result saved." };
  const grade = parsed.data.grade
    ? `${parsed.data.grade}-grade session.`
    : "Session complete.";
  const interruptions = parsed.data.interruptions ?? 0;
  if (interruptions > 0)
    return {
      title: grade,
      message: `${interruptions} interruption${interruptions === 1 ? "" : "s"} kept this from cleaner work.`,
    };
  return { title: grade, message: "Result saved." };
}
