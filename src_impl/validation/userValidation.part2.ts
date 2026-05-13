

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