import * as repository from "../repository";
import {
  signUp,
  signIn,
} from "../service";
import type { AuthCredentials, SignUpMetadata } from "../types";

jest.mock("../repository");

// ── Fixtures ───────────────────────────────────────────────────────────────

const validCredentials: AuthCredentials = {
  email: "test@example.com",
  password: "Password1!",
};

const validMetadata: SignUpMetadata = {
  firstName: "Test",
  lastName: "User",
};

const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  username: "testuser",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  displayName: "Test User",
  verified: true,
  role: "user" as const,
  status: "active" as const,
  preferences: {
    theme: "system" as const,
    language: "en",
    notifications: {
      push: true,
      email: false,
      sms: false,
      inApp: true,
      digestFrequency: "daily" as const,
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "07:00",
        timezone: "UTC",
      },
    },
    privacy: {
      profileVisibility: "private" as const,
      activityStatus: true,
      readReceipts: false,
      allowTagging: true,
      allowMentions: true,
      dataSharing: false,
    },
    accessibility: {
      reduceMotion: false,
      highContrast: false,
      largeText: false,
      screenReaderOptimized: false,
    },
  },
  metadata: { deviceHistory: [], loginCount: 1 },
};

// ── signUp ─────────────────────────────────────────────────────────────────

describe("signUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when email is empty", async () => {
    const result = await signUp(
      { email: "", password: "Password1!" },
      validMetadata,
    );
    expect(result.user).toBeNull();
    expect(result.error).toBeTruthy();
    expect(result.error?.message).toContain("Email and password are required");
  });

  it("returns error when password is empty", async () => {
    const result = await signUp(
      { email: "test@example.com", password: "" },
      validMetadata,
    );
    expect(result.user).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it("delegates to repository.signUpWithEmail with correct args", async () => {
    jest
      .mocked(repository.signUpWithEmail)
      .mockResolvedValue({ user: mockUser, error: null });

    const result = await signUp(validCredentials, validMetadata);

    expect(repository.signUpWithEmail).toHaveBeenCalledWith(
      validCredentials.email,
      validCredentials.password,
      validMetadata,
    );
    expect(result.user).toEqual(mockUser);
    expect(result.error).toBeNull();
  });

  it("propagates repository errors", async () => {
    jest
      .mocked(repository.signUpWithEmail)
      .mockResolvedValue({ user: null, error: new Error("Email taken") });

    const result = await signUp(validCredentials, validMetadata);
    expect(result.user).toBeNull();
    expect(result.error?.message).toBe("Email taken");
  });
});

// ── signIn ─────────────────────────────────────────────────────────────────

describe("signIn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when email is empty", async () => {
    const result = await signIn({ email: "", password: "Password1!" });
    expect(result.user).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it("returns error when password is empty", async () => {
    const result = await signIn({ email: "test@example.com", password: "" });
    expect(result.user).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it("delegates to repository.signInWithEmail", async () => {
    jest
      .mocked(repository.signInWithEmail)
      .mockResolvedValue({ user: mockUser, error: null });

    const result = await signIn(validCredentials);

    expect(repository.signInWithEmail).toHaveBeenCalledWith(
      validCredentials.email,
      validCredentials.password,
    );
    expect(result.user).toEqual(mockUser);
    expect(result.error).toBeNull();
  });

  it("propagates sign-in errors from repository", async () => {
    jest
      .mocked(repository.signInWithEmail)
      .mockResolvedValue({ user: null, error: new Error("Invalid credentials") });

    const result = await signIn(validCredentials);
    expect(result.user).toBeNull();
    expect(result.error?.message).toBe("Invalid credentials");
  });
});
