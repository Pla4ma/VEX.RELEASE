const SIGNUP_COOLDOWN_MS = 60_000;

let activeSignupEmail: string | null = null;
const recentSignupEmails = new Map<string, number>();

export function normalizeSignupEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function canSubmitSignup(email: string): boolean {
  const recentSignupAt = recentSignupEmails.get(email) ?? 0;
  return activeSignupEmail !== email && Date.now() - recentSignupAt >= SIGNUP_COOLDOWN_MS;
}

export function beginSignup(email: string): void {
  activeSignupEmail = email;
}

export function finishSignup(email: string, sentVerification: boolean): void {
  if (sentVerification) {
    recentSignupEmails.set(email, Date.now());
  }
  activeSignupEmail = null;
}
