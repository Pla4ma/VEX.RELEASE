import type { User as SupabaseUser } from "@supabase/supabase-js";

import { getSupabaseClient } from "../config/supabase";
import type { User } from "../types/models";

type UserRow = {
  onboarding_completed_at: string | null;
};

export function mapSupabaseUser(
  sbUser: SupabaseUser,
  overrideMetadata?: {
    firstName: string;
    lastName: string;
  },
): User {
  const now = new Date().toISOString();
  const metadata = sbUser.user_metadata || {};

  const firstName = overrideMetadata?.firstName || metadata.first_name || "";
  const lastName = overrideMetadata?.lastName || metadata.last_name || "";
  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : sbUser.email?.split("@")[0] || "";

  return {
    id: sbUser.id,
    email: sbUser.email || "",
    username: metadata.username || sbUser.email?.split("@")[0] || "",
    firstName,
    lastName,
    displayName,
    squadId: metadata.squad_id || metadata.squadId || null,
    avatar: metadata.avatar_url || undefined,
    bio: metadata.bio || undefined,
    verified: Boolean(metadata.verified),
    role: metadata.role || "user",
    status: "active",
    preferences: {
      theme: metadata.theme || "system",
      language: metadata.language || "en",
      notifications: {
        push: true,
        email: true,
        sms: false,
        inApp: true,
        digestFrequency: "daily",
        quietHours: {
          enabled: false,
          start: "22:00",
          end: "08:00",
          timezone: "UTC",
        },
      },
      privacy: {
        profileVisibility: "public",
        activityStatus: true,
        readReceipts: true,
        allowTagging: true,
        allowMentions: true,
        dataSharing: false,
      },
      accessibility: {
        reduceMotion: false,
        highContrast: false,
        largeText: false,
        screenReaderOptimized: false,
      },
    },
    metadata: {
      lastLoginAt: sbUser.last_sign_in_at || now,
      loginCount: metadata.login_count || 1,
      deviceHistory: [],
    },
    createdAt: sbUser.created_at || now,
    updatedAt: sbUser.updated_at || now,
    onboardingCompletedAt: null,
  };
}

export async function attachOnboardingCompletion(user: User): Promise<User> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle<UserRow>();

  if (error) {
    return user;
  }

  return {
    ...user,
    onboardingCompletedAt: data?.onboarding_completed_at ?? null,
  };
}
