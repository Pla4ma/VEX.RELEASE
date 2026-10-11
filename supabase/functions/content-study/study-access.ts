import { z } from 'https://esm.sh/zod@3.22.4';
import type { ContentStudyClient } from './supabase-client.ts';

const StudyContentAccessRowSchema = z.object({
  can_upload: z.boolean(),
  fallback_label: z.string().nullable(),
});
export type StudyContentAccessRow = z.infer<typeof StudyContentAccessRowSchema>;
const StudyContentAccessSchema = z.object({
  canUpload: z.boolean(),
  fallbackLabel: z.string().nullable(),
});
const StudyContentAccessRowsSchema = z.array(StudyContentAccessRowSchema);

export type StudyContentAccess = z.infer<typeof StudyContentAccessSchema>;

export function parseStudyContentAccessRows(data: unknown): StudyContentAccess {
  const [row] = StudyContentAccessRowsSchema.parse(data);
  if (!row) throw new Error('Study access check returned no result');
  return StudyContentAccessSchema.parse({
    canUpload: row.can_upload,
    fallbackLabel: row.fallback_label,
  });
}

export async function getStudyContentAccess(
  supabase: ContentStudyClient,
  userId: string,
): Promise<StudyContentAccess> {
  const { data, error } = await supabase.rpc('get_study_content_access', {
    p_user_id: userId,
  });
  if (error) {
    throw new Error('Unable to verify Study content access');
  }
  return parseStudyContentAccessRows(data ?? []);
}
