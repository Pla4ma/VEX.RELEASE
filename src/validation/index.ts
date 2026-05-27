/**
 * Validation System Export
 */

export {
  // Auth schemas
  emailSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,

  // User profile schemas
  userProfileSchema,
  changePasswordSchema,
  type UserProfileFormData,
  type ChangePasswordFormData,

  // Settings schemas
  notificationSettingsSchema,
  privacySettingsSchema,
  type NotificationSettingsFormData,
  type PrivacySettingsFormData,

  // Search schemas
  searchQuerySchema,
  type SearchQueryFormData,

  // Helper functions
  validate,
  validateField,
} from "./schemas";
