/**
 * Tests for Challenges — Error Classes + RepositoryError
 */

import { describe, it, expect } from "@jest/globals";

import {
  ChallengeError,
  ChallengeNotFoundError,
  ChallengeNotActiveError,
  RerollNotAllowedError,
  RerollLimitExceededError,
  InsufficientGemsForRerollError,
} from "../errors";
import { RepositoryError } from "../repository-helpers";

describe("Error Classes", () => {
  it("ChallengeError stores code and context", () => {
    const err = new ChallengeError("test msg", "TEST_CODE", { foo: "bar" });
    expect(err.message).toBe("test msg");
    expect(err.code).toBe("TEST_CODE");
    expect(err.context).toEqual({ foo: "bar" });
    expect(err.name).toBe("ChallengeError");
    expect(err).toBeInstanceOf(Error);
  });

  it("ChallengeNotFoundError includes challengeId", () => {
    const err = new ChallengeNotFoundError("c-123");
    expect(err.code).toBe("CHALLENGE_NOT_FOUND");
    expect(err.message).toContain("c-123");
    expect(err.context).toEqual({ challengeId: "c-123" });
  });

  it("ChallengeNotActiveError includes challengeId and status", () => {
    const err = new ChallengeNotActiveError("c-1", "CLAIMED");
    expect(err.code).toBe("CHALLENGE_NOT_ACTIVE");
    expect(err.context).toEqual({ challengeId: "c-1", status: "CLAIMED" });
  });

  it("RerollNotAllowedError is a ChallengeError", () => {
    const err = new RerollNotAllowedError("nope", "REROLL_NOT_ALLOWED");
    expect(err).toBeInstanceOf(ChallengeError);
  });

  it("RerollLimitExceededError is a ChallengeError", () => {
    const err = new RerollLimitExceededError("limit", "REROLL_LIMIT");
    expect(err).toBeInstanceOf(ChallengeError);
  });

  it("InsufficientGemsForRerollError is a ChallengeError", () => {
    const err = new InsufficientGemsForRerollError("gems", "INSUFFICIENT_GEMS");
    expect(err).toBeInstanceOf(ChallengeError);
  });
});

describe("RepositoryError", () => {
  it("stores operation and originalError", () => {
    const original = new Error("db fail");
    const err = new RepositoryError("fetchChallengeById", original);
    expect(err.operation).toBe("fetchChallengeById");
    expect(err.originalError).toBe(original);
    expect(err.name).toBe("RepositoryError");
    expect(err.message).toContain("fetchChallengeById");
  });

  it("handles non-Error originalError", () => {
    const err = new RepositoryError("test", "string error");
    expect(err.message).toContain("string error");
  });
});
