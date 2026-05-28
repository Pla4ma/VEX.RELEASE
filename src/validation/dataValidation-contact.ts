import type { DataValidationResult } from "./dataValidation-types";

export const validatePhoneNumber = (phone: string): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedPhone = phone;
  if (!phone || typeof phone !== "string") {
    errors.push("Phone number is required and must be a string");
    return { isValid: false, errors, warnings };
  }
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length < 10) {
    errors.push("Phone number must have at least 10 digits");
  }
  if (digitsOnly.length > 15) {
    errors.push("Phone number has too many digits (maximum 15)");
  }
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    errors.push("Phone number contains invalid characters");
  }
  if (!phone.startsWith("+") && digitsOnly.length === 11) {
    warnings.push("Consider using international format with country code");
  }
  sanitizedPhone = phone.trim();
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedPhone,
  };
};

export const validateCreditCard = (
  cardNumber: string,
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedCard = cardNumber;
  if (!cardNumber || typeof cardNumber !== "string") {
    errors.push("Card number is required and must be a string");
    return { isValid: false, errors, warnings };
  }
  const cleanCard = cardNumber.replace(/[\s-]/g, "");
  if (cleanCard.length < 13 || cleanCard.length > 19) {
    errors.push("Card number must be between 13 and 19 digits");
  }
  if (!/^\d+$/.test(cleanCard)) {
    errors.push("Card number must contain only digits");
  }
  let sum = 0;
  let isEven = false;
  for (let i = cleanCard.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanCard[i]!, 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    isEven = !isEven;
  }
  if (sum % 10 !== 0) {
    errors.push("Invalid card number (failed Luhn check)");
  }
  let cardType = "unknown";
  if (/^4/.test(cleanCard)) {
    cardType = "visa";
  } else if (/^5[1-5]/.test(cleanCard)) {
    cardType = "mastercard";
  } else if (/^3[47]/.test(cleanCard)) {
    cardType = "amex";
  } else if (/^6(?:011|5)/.test(cleanCard)) {
    cardType = "discover";
  }
  if (cardType !== "unknown") {
    warnings.push(`Detected card type: ${cardType}`);
  }
  sanitizedCard = sanitizedCard.trim();
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedCard,
  };
};
