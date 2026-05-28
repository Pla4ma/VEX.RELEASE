import type {
  AuthValidationResult,
  LoginCredentials,
  PasswordResetData,
  TwoFactorData,
} from "./authValidationTypes";

export const validateLoginCredentials = (
  credentials: LoginCredentials,
): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!credentials.email) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      errors.push("Invalid email format");
    }
  }
  if (!credentials.password) {
    errors.push("Password is required");
  } else {
    if (credentials.password.length < 1) {
      errors.push("Password cannot be empty");
    }
    if (credentials.password.length > 256) {
      errors.push("Password is too long");
    }
    if (credentials.password.length < 8) {
      securityLevel = "low";
      warnings.push("Consider using a stronger password");
    } else if (
      credentials.password.length >= 12 &&
      /[A-Z]/.test(credentials.password) &&
      /[a-z]/.test(credentials.password) &&
      /\d/.test(credentials.password) &&
      /[!@#$%^&*]/.test(credentials.password)
    ) {
      securityLevel = "high";
    }
  }
  if (credentials.twoFactorCode) {
    if (!/^\d{6}$/.test(credentials.twoFactorCode)) {
      errors.push("Two-factor code must be 6 digits");
    }
  }
  if (credentials.rememberMe && securityLevel === "low") {
    warnings.push('Using "Remember Me" with weak password is not recommended');
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};

export const validatePasswordReset = (
  data: PasswordResetData,
): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!data.email) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }
  if (data.token) {
    if (typeof data.token !== "string" || data.token.length < 10) {
      errors.push("Invalid reset token format");
    }
  }
  if (!data.newPassword) {
    errors.push("New password is required");
  } else {
    if (data.newPassword.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (data.newPassword.length > 128) {
      errors.push("Password is too long");
    }
    if (!/[A-Z]/.test(data.newPassword)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(data.newPassword)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/\d/.test(data.newPassword)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.newPassword)) {
      errors.push("Password must contain at least one special character");
    }
    if (
      data.newPassword.length >= 12 &&
      /[A-Z]/.test(data.newPassword) &&
      /[a-z]/.test(data.newPassword) &&
      /\d/.test(data.newPassword) &&
      /[!@#$%^&*]/.test(data.newPassword)
    ) {
      securityLevel = "high";
    } else if (
      data.newPassword.length < 8 ||
      !/[!@#$%^&*]/.test(data.newPassword)
    ) {
      securityLevel = "low";
      warnings.push("Consider using a stronger password");
    }
  }
  if (!data.confirmPassword) {
    errors.push("Password confirmation is required");
  } else if (data.newPassword !== data.confirmPassword) {
    errors.push("Passwords do not match");
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};

export const validateTwoFactor = (
  data: TwoFactorData,
): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "high";
  if (!data.code) {
    errors.push("Two-factor code is required");
  } else {
    if (
      data.method === "totp" ||
      data.method === "sms" ||
      data.method === "email"
    ) {
      if (!/^\d{6}$/.test(data.code)) {
        errors.push("Two-factor code must be 6 digits");
      }
    } else if (data.method === "backup") {
      if (!/^[a-zA-Z0-9]{8,12}$/.test(data.code)) {
        errors.push("Backup code must be 8-12 alphanumeric characters");
      }
    }
  }
  if (!data.method) {
    errors.push("Two-factor method is required");
  } else {
    const validMethods = ["totp", "sms", "email", "backup"];
    if (!validMethods.includes(data.method)) {
      errors.push("Invalid two-factor method");
    }
    if (data.method === "backup") {
      securityLevel = "medium";
      warnings.push("Using backup code - consider setting up 2FA again");
    }
  }
  if (data.backupCode) {
    if (!/^[a-zA-Z0-9]{8,12}$/.test(data.backupCode)) {
      errors.push("Invalid backup code format");
    }
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};
