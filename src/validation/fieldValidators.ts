import type { UserValidationResult } from "./userValidationTypes";

export const validateEmail = (email: string): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!email) {
    errors.push("Email is required");
    return { isValid: false, errors, warnings };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push("Invalid email format");
  }
  if (email.length > 254) {
    errors.push("Email is too long (maximum 254 characters)");
  }
  const domain = email.split("@")[1];
  if (domain && domain.length > 63) {
    errors.push("Email domain is too long");
  }
  const suspiciousDomains = [
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
  ];
  if (
    domain &&
    suspiciousDomains.some((suspicious) => domain.includes(suspicious))
  ) {
    warnings.push("Using temporary email service");
  }
  return { isValid: errors.length === 0, errors, warnings };
};

export const validatePassword = (
  password: string,
  confirmPassword?: string,
): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors, warnings };
  }
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (password.length > 128) {
    errors.push("Password is too long (maximum 128 characters)");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  const commonPasswords = ["password", "123456", "qwerty", "admin", "letmein"];
  if (
    commonPasswords.some((common) => password.toLowerCase().includes(common))
  ) {
    errors.push("Password contains common patterns");
  }
  if (confirmPassword && password !== confirmPassword) {
    errors.push("Passwords do not match");
  }
  if (
    password.includes(" ") ||
    password.includes("\t") ||
    password.includes("\n")
  ) {
    warnings.push("Password contains whitespace characters");
  }
  return { isValid: errors.length === 0, errors, warnings };
};

export const validateUsername = (username: string): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!username) {
    errors.push("Username is required");
    return { isValid: false, errors, warnings };
  }
  if (username.length < 3) {
    errors.push("Username must be at least 3 characters long");
  }
  if (username.length > 30) {
    errors.push("Username is too long (maximum 30 characters)");
  }
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    errors.push(
      "Username can only contain letters, numbers, underscores, and hyphens",
    );
  }
  if (username.startsWith("_") || username.startsWith("-")) {
    errors.push("Username cannot start with underscore or hyphen");
  }
  if (username.endsWith("_") || username.endsWith("-")) {
    errors.push("Username cannot end with underscore or hyphen");
  }
  const reservedUsernames = [
    "admin",
    "root",
    "system",
    "api",
    "www",
    "mail",
    "ftp",
    "support",
  ];
  if (reservedUsernames.includes(username.toLowerCase())) {
    errors.push("Username is reserved");
  }
  if (/\d{4,}/.test(username)) {
    warnings.push("Username contains multiple consecutive numbers");
  }
  return { isValid: errors.length === 0, errors, warnings };
};
