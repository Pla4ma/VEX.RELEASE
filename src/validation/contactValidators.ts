import type { UserValidationResult } from "./userValidationTypes";

export const validateName = (
  name: string,
  fieldName: string = "Name",
): UserValidationResult => {
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
    errors.push(
      `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
    );
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
  return { isValid: errors.length === 0, errors, warnings };
};

export const validatePhone = (phone?: string): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!phone) {
    return { isValid: true, errors, warnings };
  }
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  if (!phoneRegex.test(phone)) {
    errors.push(
      "Phone number can only contain digits, spaces, hyphens, and parentheses",
    );
  }
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length < 10) {
    errors.push("Phone number must have at least 10 digits");
  }
  if (digitsOnly.length > 15) {
    errors.push("Phone number has too many digits (maximum 15)");
  }
  if (phone.startsWith("00")) {
    warnings.push("Consider using + instead of 00 for international format");
  }
  return { isValid: errors.length === 0, errors, warnings };
};

export const validateDateOfBirth = (
  dateOfBirth?: string,
): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!dateOfBirth) {
    return { isValid: true, errors, warnings };
  }
  const date = new Date(dateOfBirth);
  const now = new Date();
  if (isNaN(date.getTime())) {
    errors.push("Invalid date format");
    return { isValid: false, errors, warnings };
  }
  const age = Math.floor(
    (now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  if (age < 13) {
    errors.push("User must be at least 13 years old");
  }
  if (age > 120) {
    errors.push("Invalid date of birth");
  }
  if (age < 16) {
    warnings.push("User is under 16 years old");
  }
  if (date > now) {
    errors.push("Date of birth cannot be in the future");
  }
  return { isValid: errors.length === 0, errors, warnings };
};
