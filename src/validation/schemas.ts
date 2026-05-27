import { z } from "zod";

const optionalNameSchema = z.union([
  z.literal(""),
  z
    .string()
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
]);

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    agreeToTerms: z.boolean().refine((value) => value === true, {
      message: "You must agree to the terms and conditions",
    }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    email: emailSchema,
    firstName: optionalNameSchema.default(""),
    lastName: optionalNameSchema.default(""),
    password: passwordSchema,
    phone: z
      .string()
      .optional()
      .refine((value) => !value || /^\+?[\d\s-()]{10,}$/.test(value), {
        message: "Please enter a valid phone number",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    confirmPassword: z.string().min(1, "Please confirm your new password"),
    password: passwordSchema,
    token: z.string().min(1, "Token is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const userProfileSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || /^\+?[\d\s-()]{10,}$/.test(value), {
      message: "Please enter a valid phone number",
    }),
  website: z
    .string()
    .url("Please enter a valid URL")
    .max(200, "URL must be less than 200 characters")
    .optional()
    .or(z.literal("")),
});
export type UserProfileFormData = z.infer<typeof userProfileSchema>;

export const changePasswordSchema = z
  .object({
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const notificationSettingsSchema = z.object({
  dailyDigest: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  mentionAlert: z.boolean().default(true),
  newMessageAlert: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
});
export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;

export const privacySettingsSchema = z.object({
  allowSearchByEmail: z.boolean().default(false),
  allowSearchByPhone: z.boolean().default(false),
  allowTagging: z.boolean().default(true),
  profileVisibility: z.enum(["public", "friends", "private"]).default("public"),
  showLastSeen: z.boolean().default(true),
  showOnlineStatus: z.boolean().default(true),
});
export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>;

export const searchQuerySchema = z.object({
  filters: z
    .object({
      category: z.string().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      sortBy: z.enum(["relevance", "date", "popularity"]).optional(),
    })
    .optional(),
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Query too long"),
});
export type SearchQueryFormData = z.infer<typeof searchQuerySchema>;

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  data?: T;
  errors?: z.ZodError["formErrors"]["fieldErrors"];
  success: boolean;
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { data: result.data, success: true };
  }
  return { errors: result.error.formErrors.fieldErrors, success: false };
}

export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
): { error?: string; success: boolean } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true };
  }
  return { error: result.error.errors[0]?.message, success: false };
}
