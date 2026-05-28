import { RepositoryError, supabase } from "./shared";

export async function upsertPushToken(
  userId: string,
  token: string,
  platform: string,
): Promise<void> {
  const { error } = await supabase
    .from("push_tokens")
    .upsert(
      {
        user_id: userId,
        token,
        platform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) {
    throw new RepositoryError("upsertPushToken", error);
  }
}
