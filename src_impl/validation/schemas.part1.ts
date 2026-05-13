import { z } from "zod";


export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^\+?[\d\s-()]{10,}$/.test(val), {
        message: 'Please enter a valid phone number',
      }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s-()]{10,}$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  website: z
    .string()
    .url('Please enter a valid URL')
    .max(200, 'URL must be less than 200 characters')
    .optional()
    .or(z.literal('')),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  });

export const notificationSettingsSchema = z.object({
  pushNotifications: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
  newMessageAlert: z.boolean().default(true),
  mentionAlert: z.boolean().default(true),
  dailyDigest: z.boolean().default(false),
});

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'friends', 'private']).default('public'),
  showOnlineStatus: z.boolean().default(true),
  showLastSeen: z.boolean().default(true),
  allowTagging: z.boolean().default(true),
  allowSearchByEmail: z.boolean().default(false),
  allowSearchByPhone: z.boolean().default(false),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Query too long'),
  filters: z
    .object({
      category: z.string().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      sortBy: z.enum(['relevance', 'date', 'popularity']).optional(),
    })
    .optional(),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError['formErrors']['fieldErrors'];
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error.formErrors.fieldErrors };
  }
}

export function validateField<T>(schema: z.ZodSchema<T>, value: unknown): {
  success: boolean;
  error?: string;
} {
  const result = schema.safeParse(value);

  if (result.success) {
    return { success: true };
  } else {
    return { success: false, error: result.error.errors[0]?.message };
  }
}