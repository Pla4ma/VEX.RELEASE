/**
 * User Validation Layer
 *
 * Comprehensive validation for user-related data including authentication,
 * profile information, permissions, and user management operations.
 */

export interface UserValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UserRegistrationData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  };
}

export interface UserPermissionData {
  userId: string;
  permissions: string[];
  roles: string[];
  accessLevel: string;
}

// Email validation
export const validateEmail = (email: string): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors, warnings };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  if (email.length > 254) {
    errors.push('Email is too long (maximum 254 characters)');
  }

  const domain = email.split('@')[1];
  if (domain && domain.length > 63) {
    errors.push('Email domain is too long');
  }

  const suspiciousDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  if (domain && suspiciousDomains.some(suspicious => domain.includes(suspicious))) {
    warnings.push('Using temporary email service');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Password validation
export const validatePassword = (password: string, confirmPassword?: string): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, warnings };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password is too long (maximum 128 characters)');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Common password patterns
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common patterns');
  }

  if (confirmPassword && password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (password.includes(' ') || password.includes('\t') || password.includes('\n')) {
    warnings.push('Password contains whitespace characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Username validation
export const validateUsername = (username: string): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!username) {
    errors.push('Username is required');
    return { isValid: false, errors, warnings };
  }

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (username.length > 30) {
    errors.push('Username is too long (maximum 30 characters)');
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }

  if (username.startsWith('_') || username.startsWith('-')) {
    errors.push('Username cannot start with underscore or hyphen');
  }

  if (username.endsWith('_') || username.endsWith('-')) {
    errors.push('Username cannot end with underscore or hyphen');
  }

  const reservedUsernames = ['admin', 'root', 'system', 'api', 'www', 'mail', 'ftp', 'support'];
  if (reservedUsernames.includes(username.toLowerCase())) {
    errors.push('Username is reserved');
  }

  if (/\d{4,}/.test(username)) {
    warnings.push('Username contains multiple consecutive numbers');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Name validation
export const validateName = (name: string, fieldName: string = 'Name'): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors, warnings };
  }

  if (name.length < 2) {
    errors.push(`${fieldName} must be at least 2 characters long`);
  }

  if (name.length > 50) {
    errors.push(`${fieldName} is too long (maximum 50 characters)`);
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }

  if (name.trim() !== name) {
    errors.push(`${fieldName} cannot start or end with whitespace`);
  }

  if (/\s{2,}/.test(name)) {
    errors.push(`${fieldName} cannot contain multiple consecutive spaces`);
  }

  if (/(.)\1{3,}/.test(name)) {
    warnings.push(`${fieldName} contains repeated characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Phone validation
export const validatePhone = (phone?: string): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!phone) {
    return { isValid: true, errors, warnings };
  }

  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    errors.push('Phone number can only contain digits, spaces, hyphens, and parentheses');
  }

  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    errors.push('Phone number must have at least 10 digits');
  }

  if (digitsOnly.length > 15) {
    errors.push('Phone number has too many digits (maximum 15)');
  }

  if (phone.startsWith('00')) {
    warnings.push('Consider using + instead of 00 for international format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Date of birth validation
export const validateDateOfBirth = (dateOfBirth?: string): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!dateOfBirth) {
    return { isValid: true, errors, warnings };
  }

  const date = new Date(dateOfBirth);
  const now = new Date();

  if (isNaN(date.getTime())) {
    errors.push('Invalid date format');
    return { isValid: false, errors, warnings };
  }

  const age = Math.floor((now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  if (age < 13) {
    errors.push('User must be at least 13 years old');
  }

  if (age > 120) {
    errors.push('Invalid date of birth');
  }

  if (age < 16) {
    warnings.push('User is under 16 years old');
  }

  if (date > now) {
    errors.push('Date of birth cannot be in the future');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// User registration validation
export const validateUserRegistration = (data: UserRegistrationData): UserValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Email validation
  const emailValidation = validateEmail(data.email);
  allErrors.push(...emailValidation.errors);
  allWarnings.push(...emailValidation.warnings);

  // Password validation
  const passwordValidation = validatePassword(data.password, data.confirmPassword);
  allErrors.push(...passwordValidation.errors);
  allWarnings.push(...passwordValidation.warnings);

  // Username validation
  const usernameValidation = validateUsername(data.username);
  allErrors.push(...usernameValidation.errors);
  allWarnings.push(...usernameValidation.warnings);

  // Name validation
  const firstNameValidation = validateName(data.firstName, 'First Name');
  allErrors.push(...firstNameValidation.errors);
  allWarnings.push(...firstNameValidation.warnings);

  const lastNameValidation = validateName(data.lastName, 'Last Name');
  allErrors.push(...lastNameValidation.errors);
  allWarnings.push(...lastNameValidation.warnings);

  // Phone validation
  const phoneValidation = validatePhone(data.phone);
  allErrors.push(...phoneValidation.errors);
  allWarnings.push(...phoneValidation.warnings);

  // Date of birth validation
  const dobValidation = validateDateOfBirth(data.dateOfBirth);
  allErrors.push(...dobValidation.errors);
  allWarnings.push(...dobValidation.warnings);

  // Terms and privacy validation
  if (!data.acceptTerms) {
    allErrors.push('You must accept the terms of service');
  }

  if (!data.acceptPrivacy) {
    allErrors.push('You must accept the privacy policy');
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

// User profile validation
export const validateUserProfile = (data: UserProfileData): UserValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Email validation
  const emailValidation = validateEmail(data.email);
  allErrors.push(...emailValidation.errors);
  allWarnings.push(...emailValidation.warnings);

  // Name validation
  const firstNameValidation = validateName(data.firstName, 'First Name');
  allErrors.push(...firstNameValidation.errors);
  allWarnings.push(...firstNameValidation.warnings);

  const lastNameValidation = validateName(data.lastName, 'Last Name');
  allErrors.push(...lastNameValidation.errors);
  allWarnings.push(...lastNameValidation.warnings);

  // Phone validation
  const phoneValidation = validatePhone(data.phone);
  allErrors.push(...phoneValidation.errors);
  allWarnings.push(...phoneValidation.warnings);

  // Bio validation
  if (data.bio) {
    if (data.bio.length > 500) {
      allErrors.push('Bio is too long (maximum 500 characters)');
    }

    if (data.bio.trim() !== data.bio) {
      allErrors.push('Bio cannot start or end with whitespace');
    }

    if (/\s{3,}/.test(data.bio)) {
      allWarnings.push('Bio contains multiple consecutive spaces');
    }
  }

  // Avatar validation
  if (data.avatar) {
    try {
      new URL(data.avatar);

      const validImageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasValidFormat = validImageFormats.some(format =>
        data.avatar!.toLowerCase().includes(format)
      );

      if (!hasValidFormat) {
        allWarnings.push('Avatar URL may not be a valid image format');
      }
    } catch {
      allErrors.push('Avatar URL is invalid');
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

// User permission validation
export const validateUserPermissions = (data: UserPermissionData): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.userId) {
    errors.push('User ID is required');
  }

  if (!data.permissions || data.permissions.length === 0) {
    warnings.push('User has no permissions assigned');
  }

  if (!data.roles || data.roles.length === 0) {
    warnings.push('User has no roles assigned');
  }

  if (!data.accessLevel) {
    errors.push('Access level is required');
  }

  const validAccessLevels = ['guest', 'user', 'moderator', 'admin', 'super_admin'];
  if (data.accessLevel && !validAccessLevels.includes(data.accessLevel)) {
    errors.push('Invalid access level');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// User ID validation
export const validateUserId = (userId: string): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!userId) {
    errors.push('User ID is required');
    return { isValid: false, errors, warnings };
  }

  if (typeof userId !== 'string') {
    errors.push('User ID must be a string');
  }

  if (userId.length < 1) {
    errors.push('User ID cannot be empty');
  }

  if (userId.length > 100) {
    errors.push('User ID is too long');
  }

  // Check for valid UUID format or custom ID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const customIdRegex = /^[a-zA-Z0-9_-]+$/;

  if (!uuidRegex.test(userId) && !customIdRegex.test(userId)) {
    warnings.push('User ID format is unusual');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
