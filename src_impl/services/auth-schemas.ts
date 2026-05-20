import { z } from "zod";
import type { User } from "../types/models";

export const TokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().positive(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    avatar: z.string().optional(),
    role: z.enum(["user", "admin", "moderator"]),
    username: z.string().optional(),
    displayName: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    verified: z.boolean().optional(),
    status: z.enum(["active", "inactive", "suspended", "pending"]).optional(),
  }),
});

export const RefreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().positive(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

export function transformAuthUser(apiUser: TokenResponse["user"]): User {
  const now = new Date().toISOString();
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    avatar: apiUser.avatar,
    role: apiUser.role as User["role"],
    username: apiUser.username || apiUser.email.split("@")[0]!,
    displayName: apiUser.displayName || `${apiUser.firstName} ${apiUser.lastName}`,
    verified: apiUser.verified ?? false,
    status: apiUser.status ?? "active",
    createdAt: apiUser.createdAt ?? now,
    updatedAt: apiUser.updatedAt ?? now,
    preferences: {
      theme: "system",
      language: "en",
      notifications: {
        push: true,
        email: true,
        sms: false,
        inApp: true,
        digestFrequency: "daily",
        quietHours: { enabled: false, start: "22:00", end: "08:00", timezone: "UTC" },
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
    metadata: { loginCount: 1, lastLoginAt: now, signupSource: "mobile_app", deviceHistory: [] },
  };
}
