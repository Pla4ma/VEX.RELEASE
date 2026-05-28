import { z } from "zod";
import type { User } from "../../types/models";

const UserRoleSchema = z.enum(["user", "moderator", "admin", "superadmin"]);
const UserStatusSchema = z.enum(["active", "inactive", "suspended", "pending"]);

const UserPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.string(),
  notifications: z.object({
    push: z.boolean(),
    email: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
    digestFrequency: z.enum(["realtime", "daily", "weekly", "never"]),
    quietHours: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
      timezone: z.string(),
    }),
  }),
  privacy: z.object({
    profileVisibility: z.enum(["public", "followers", "private"]),
    activityStatus: z.boolean(),
    readReceipts: z.boolean(),
    allowTagging: z.boolean(),
    allowMentions: z.boolean(),
    dataSharing: z.boolean(),
  }),
  accessibility: z.object({
    reduceMotion: z.boolean(),
    highContrast: z.boolean(),
    largeText: z.boolean(),
    screenReaderOptimized: z.boolean(),
    colorBlindMode: z
      .enum(["deuteranopia", "protanopia", "tritanopia"])
      .optional(),
  }),
});

const UserMetadataSchema = z.object({
  lastLoginAt: z.string().optional(),
  loginCount: z.number(),
  signupSource: z.string().optional(),
  referringUserId: z.string().optional(),
  deviceHistory: z.array(
    z.object({
      id: z.string(),
      platform: z.string(),
      model: z.string(),
      osVersion: z.string(),
      appVersion: z.string(),
      lastUsedAt: z.string(),
      pushToken: z.string().optional(),
    }),
  ),
});

export { UserRoleSchema, UserStatusSchema };

export const UserSchema: z.ZodType<User> = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  squadId: z.string().nullable().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  verified: z.boolean(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  preferences: UserPreferencesSchema,
  metadata: UserMetadataSchema,
  onboardingCompletedAt: z.string().nullable().optional(),
});
