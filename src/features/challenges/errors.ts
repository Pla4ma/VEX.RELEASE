export class ChallengeError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ChallengeError';
  }
}

export class ChallengeNotFoundError extends ChallengeError {
  constructor(challengeId: string) {
    super(`Challenge not found: ${challengeId}`, 'CHALLENGE_NOT_FOUND', {
      challengeId,
    });
  }
}

export class ChallengeNotActiveError extends ChallengeError {
  constructor(challengeId: string, status: string) {
    super(`Challenge is not active: ${challengeId}`, 'CHALLENGE_NOT_ACTIVE', {
      challengeId,
      status,
    });
  }
}

export class RerollNotAllowedError extends ChallengeError {}
export class RerollLimitExceededError extends ChallengeError {}
export class InsufficientGemsForRerollError extends ChallengeError {}
