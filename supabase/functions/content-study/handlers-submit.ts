import type { ContentStudyClient } from "./supabase-client.ts";
import { SubmitContentSchema } from "./schemas.ts";
import {
  getStudyContentAccess,
  type StudyContentAccess,
} from "./study-access.ts";
import {
  buildStudyContentInsert,
  isOwnedStudyFilePath,
} from "./submit-content.ts";
import { json } from "./responses.ts";

export async function handleSubmit(
  req: Request,
  supabase: ContentStudyClient,
  userId: string,
): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid content submission." }, 400);
  }
  const parsed = SubmitContentSchema.safeParse(body);
  if (!parsed.success) {
    return json({ success: false, error: "Invalid content submission." }, 400);
  }
  const request = parsed.data;
  if (
    request.type === "PDF" &&
    !isOwnedStudyFilePath(request.fileId, userId)
  ) {
    return json(
      { success: false, error: "Uploaded file path is invalid." },
      403,
    );
  }

  let access: StudyContentAccess;
  try {
    access = await getStudyContentAccess(supabase, userId);
  } catch {
    return json({
      success: false,
      error: "Could not verify Study access. Try again.",
    }, 503);
  }
  if (!access.canUpload) {
    return json({
      success: false,
      error: access.fallbackLabel ?? "Study content is not unlocked yet.",
    }, 403);
  }

  const { data: content, error } = await supabase
    .from("study_content")
    .insert(buildStudyContentInsert(userId, request))
    .select("id,status")
    .single();
  if (error || !content) {
    return json({
      success: false,
      error: "Content submission failed. Please try again.",
    }, 400);
  }
  return json({
    success: true,
    contentId: content.id,
    status: content.status,
    message: request.type === "PASTE"
      ? "Content ready"
      : "Submitted for extraction",
  });
}
