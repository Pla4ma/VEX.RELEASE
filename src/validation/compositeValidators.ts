import type {
  UserValidationResult,
  UserRegistrationData,
  UserProfileData,
  UserPermissionData,
} from "./userValidationTypes";
import { validateEmail, validatePassword, validateUsername } from "./fieldValidators";
import { validateName, validatePhone, validateDateOfBirth } from "./contactValidators";

export const validateUserRegistration = (
  data: UserRegistrationData,
): UserValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const emailValidation = validateEmail(data.email);
  allErrors.push(...emailValidation.errors);
  allWarnings.push(...emailValidation.warnings);
  const passwordValidation = validatePassword(
    data.password,
    data.confirmPassword,
  );
  allErrors.push(...passwordValidation.errors);
  allWarnings.push(...passwordValidation.warnings);
  const usernameValidation = validateUsername(data.username);
  allErrors.push(...usernameValidation.errors);
  allWarnings.push(...usernameValidation.warnings);
  const firstNameValidation = validateName(data.firstName, "First Name");
  allErrors.push(...firstNameValidation.errors);
  allWarnings.push(...firstNameValidation.warnings);
  const lastNameValidation = validateName(data.lastName, "Last Name");
  allErrors.push(...lastNameValidation.errors);
  allWarnings.push(...lastNameValidation.warnings);
  const phoneValidation = validatePhone(data.phone);
  allErrors.push(...phoneValidation.errors);
  allWarnings.push(...phoneValidation.warnings);
  const dobValidation = validateDateOfBirth(data.dateOfBirth);
  allErrors.push(...dobValidation.errors);
  allWarnings.push(...dobValidation.warnings);
  if (!data.acceptTerms) {
    allErrors.push("You must accept the terms of service");
  }
  if (!data.acceptPrivacy) {
    allErrors.push("You must accept the privacy policy");
  }
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

export const validateUserProfile = (
  data: UserProfileData,
): UserValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const emailValidation = validateEmail(data.email);
  allErrors.push(...emailValidation.errors);
  allWarnings.push(...emailValidation.warnings);
  const firstNameValidation = validateName(data.firstName, "First Name");
  allErrors.push(...firstNameValidation.errors);
  allWarnings.push(...firstNameValidation.warnings);
  const lastNameValidation = validateName(data.lastName, "Last Name");
  allErrors.push(...lastNameValidation.errors);
  allWarnings.push(...lastNameValidation.warnings);
  const phoneValidation = validatePhone(data.phone);
  allErrors.push(...phoneValidation.errors);
  allWarnings.push(...phoneValidation.warnings);
  if (data.bio) {
    if (data.bio.length > 500) {
      allErrors.push("Bio is too long (maximum 500 characters)");
    }
    if (data.bio.trim() !== data.bio) {
      allErrors.push("Bio cannot start or end with whitespace");
    }
    if (/\s{3,}/.test(data.bio)) {
      allWarnings.push("Bio contains multiple consecutive spaces");
    }
  }
  if (data.avatar) {
    try {
      new URL(data.avatar);
      const validImageFormats = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const hasValidFormat = validImageFormats.some((format) =>
        data.avatar!.toLowerCase().includes(format),
      );
      if (!hasValidFormat) {
        allWarnings.push("Avatar URL may not be a valid image format");
      }
    } catch (error: unknown) {
      allErrors.push("Avatar URL is invalid");
    }
  }
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

export const validateUserPermissions = (
  data: UserPermissionData,
): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!data.userId) {
    errors.push("User ID is required");
  }
  if (!data.permissions || data.permissions.length === 0) {
    warnings.push("User has no permissions assigned");
  }
  if (!data.roles || data.roles.length === 0) {
    warnings.push("User has no roles assigned");
  }
  if (!data.accessLevel) {
    errors.push("Access level is required");
  }
  const validAccessLevels = [
    "guest",
    "user",
    "moderator",
    "admin",
    "super_admin",
  ];
  if (data.accessLevel && !validAccessLevels.includes(data.accessLevel)) {
    errors.push("Invalid access level");
  }
  return { isValid: errors.length === 0, errors, warnings };
};

export const validateUserId = (userId: string): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!userId) {
    errors.push("User ID is required");
    return { isValid: false, errors, warnings };
  }
  if (typeof userId !== "string") {
    errors.push("User ID must be a string");
  }
  if (userId.length < 1) {
    errors.push("User ID cannot be empty");
  }
  if (userId.length > 100) {
    errors.push("User ID is too long");
  }
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const customIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!uuidRegex.test(userId) && !customIdRegex.test(userId)) {
    warnings.push("User ID format is unusual");
  }
  return { isValid: errors.length === 0, errors, warnings };
};
