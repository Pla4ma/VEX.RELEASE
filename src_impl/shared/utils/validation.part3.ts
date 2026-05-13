import { captureSilentFailure } from "../../utils/silent-failure";
import { z } from "zod";


export function isValidImageURL(value: unknown): boolean {
  if (!isValidURL(value)) {return false;}

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const url = (value as string).toLowerCase();
  return imageExtensions.some((ext) => url.endsWith(ext));
}

export function validatePassword(password: string): PasswordValidationResult {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters');
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Complexity checks
  if (/[a-z]/.test(password)) {score += 1;}
  else {feedback.push('Add lowercase letters');}

  if (/[A-Z]/.test(password)) {score += 1;}
  else {feedback.push('Add uppercase letters');}

  if (/\d/.test(password)) {score += 1;}
  else {feedback.push('Add numbers');}

  if (/[^a-zA-Z0-9]/.test(password)) {score += 1;}
  else {feedback.push('Add special characters');}

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score >= 5) {strength = 'strong';}
  else if (score >= 3) {strength = 'medium';}
  else {strength = 'weak';}

  return {
    valid: score >= 3 && password.length >= 8,
    strength,
    score,
    feedback,
  };
}