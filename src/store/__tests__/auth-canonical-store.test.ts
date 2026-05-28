import fs from "fs";
import path from "path";
import * as canonicalStore from "../index";
import * as compatibilityStore from "../../store";
import { setSentryUser, clearSentryUser } from "../../config/sentry";
import { revenueCatService } from "../../shared/monetization/revenuecat-service";
import {
  getCurrentUser,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from "../../services/supabaseAuth";
import { progressionService } from "../../services/progressionService";
import { streakService } from "../../services/streakService";
import { mockUser } from "./auth-canonical-store.fixtures";

describe("canonical auth store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    canonicalStore.useAuthStore.setState({
      error: null,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  it("../store resolves to the canonical store exports", () => {
    expect(compatibilityStore.useAuthStore).toBe(canonicalStore.useAuthStore);
    expect(compatibilityStore.useAppStore).toBe(canonicalStore.useAppStore);
    expect(compatibilityStore.useUIStore).toBe(canonicalStore.useUIStore);
  });

  it("src/store.ts is only a compatibility re-export, not token auth", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src", "store.ts"),
      "utf8",
    );

    expect(source.trim()).toBe('export * from "./store/index";');
    ["sessionToken", "setSessionToken", "SecureStorageKeys.AUTH_TOKEN"].forEach(
      (token) => {
        expect(source).not.toContain(token);
      },
    );
  });

  it("loginWithCredentials uses Supabase auth and binds user services", async () => {
    jest
      .mocked(signInWithEmail)
      .mockResolvedValueOnce({ error: null, user: mockUser });

    await expect(
      canonicalStore.useAuthStore
        .getState()
        .loginWithCredentials("test@example.com", "password"),
    ).resolves.toBe(true);

    expect(signInWithEmail).toHaveBeenCalledWith("test@example.com", "password");
    expect(setSentryUser).toHaveBeenCalledWith(
      mockUser.id,
      mockUser.email,
      mockUser.username,
    );
    expect(revenueCatService.setUserId).toHaveBeenCalledWith(mockUser.id);
    expect(progressionService.setUserId).toHaveBeenCalledWith(mockUser.id);
    expect(streakService.setUserId).toHaveBeenCalledWith(mockUser.id);
  });

  it("register uses Supabase auth", async () => {
    jest
      .mocked(signUpWithEmail)
      .mockResolvedValueOnce({ error: null, user: mockUser });

    await expect(
      canonicalStore.useAuthStore.getState().register({
        agreeToTerms: true,
        confirmPassword: "Password1!",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        password: "Password1!",
      }),
    ).resolves.toBe(true);

    expect(signUpWithEmail).toHaveBeenCalledWith(
      "test@example.com",
      "Password1!",
      {
        firstName: "Test",
        lastName: "User",
      },
    );
  });

  it("checkAuth reflects Supabase current user", async () => {
    jest
      .mocked(getCurrentUser)
      .mockResolvedValueOnce({ error: null, user: mockUser });

    await canonicalStore.useAuthStore.getState().checkAuth();

    expect(canonicalStore.useAuthStore.getState().user).toEqual(mockUser);
    expect(canonicalStore.useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("logout clears Supabase session and app auth bindings", async () => {
    canonicalStore.useAuthStore.setState({
      isAuthenticated: true,
      user: mockUser,
    });
    jest.mocked(signOut).mockResolvedValueOnce({ error: null });

    await canonicalStore.useAuthStore.getState().logout();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(canonicalStore.useAuthStore.getState().user).toBeNull();
    expect(canonicalStore.useAuthStore.getState().isAuthenticated).toBe(false);
    expect(clearSentryUser).toHaveBeenCalledTimes(1);
    expect(revenueCatService.clearUserId).toHaveBeenCalledTimes(1);
    expect(progressionService.reset).toHaveBeenCalledTimes(1);
    expect(streakService.reset).toHaveBeenCalledTimes(1);
  });
});
