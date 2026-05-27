import {
  mockPurchase,
  mockRestore,
  mockRefresh,
  mockRetry,
  mockGoBack,
  mockedUsePaywall,
  mockedUsePremiumStatus,
  mockedCapture,
  revenueCatError,
  mockPaywallState,
  renderPaywall,
  containsText,
  pressByLabel,
} from "./PaywallScreen-helpers";

describe("PaywallScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPurchase.mockResolvedValue({ success: true });
    mockRestore.mockResolvedValue({ success: true });
    mockRefresh.mockResolvedValue();
    mockRetry.mockResolvedValue();
    mockPaywallState();
    mockedUsePremiumStatus.mockReturnValue({
      isPremium: false,
      isLoading: false,
      entitlements: [],
      refresh: mockRefresh,
    });
  });

  it("shows free boundaries and live plans to free users", () => {
    const output = renderPaywall();
    expect(
      containsText(
        output,
        "Core sessions, basic progress, streak building, and earned rewards stay free.",
      ),
    ).toBe(true);
    expect(containsText(output, "Your streak is worth protecting.")).toBe(true);
    expect(
      containsText(
        output,
        "You just proved this routine matters. Streak Shield can protect one missed day when life interrupts.",
      ),
    ).toBe(true);
    expect(containsText(output, "Protect My Streak")).toBe(true);
    expect(containsText(output, "Annual")).toBe(true);
    expect(mockedCapture).toHaveBeenCalled();
  });

  it("shows active premium state for premium users", () => {
    mockedUsePremiumStatus.mockReturnValue({
      isPremium: true,
      isLoading: false,
      entitlements: [],
      refresh: mockRefresh,
    });
    const output = renderPaywall();
    expect(containsText(output, "Premium is active")).toBe(true);
    expect(containsText(output, "Already Premium")).toBe(true);
  });

  it("does not show fake fallback pricing when offerings are missing", () => {
    mockPaywallState({ offerings: null, packages: [], error: null });
    const output = renderPaywall();
    expect(containsText(output, "Live plans are not available yet")).toBe(true);
    expect(containsText(output, "Live pricing unavailable")).toBe(false);
  });

  it("handles offering load failures with retry", () => {
    mockPaywallState({
      offerings: null,
      packages: [],
      error: revenueCatError("NETWORK_ERROR", "Network down"),
    });
    const output = renderPaywall();
    const retryButton = output.root
      .findAllByProps({ accessibilityRole: "button" })
      .find((node) => node.props.onPress === mockRetry);
    if (!retryButton) {
      throw new Error("Retry button missing");
    }
    retryButton.props.onPress();
    expect(
      containsText(
        output,
        "Pricing is temporarily unavailable. Your progress is safe.",
      ),
    ).toBe(true);
    expect(mockRetry).toHaveBeenCalled();
  });

  it("refreshes entitlement and returns after purchase success", async () => {
    const output = renderPaywall();
    await pressByLabel(output, "Continue with Annual Premium");

    expect(mockPurchase).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("keeps the paywall open with user-facing copy after purchase failure", async () => {
    mockPurchase.mockResolvedValueOnce({
      error: revenueCatError("STORE_PROBLEM", "Store unavailable"),
      errorCode: "STORE_PROBLEM",
      success: false,
    });
    const output = renderPaywall();
    await pressByLabel(output, "Continue with Annual Premium");

    expect(mockGoBack).not.toHaveBeenCalled();
    expect(containsText(output, "Purchase did not go through")).toBe(true);
    expect(
      containsText(
        output,
        "Nothing was charged here in VEX. Please try again, or restore if you already subscribed.",
      ),
    ).toBe(true);
  });

  it("shows user-facing restore failure copy", async () => {
    mockRestore.mockResolvedValueOnce({
      error: revenueCatError("NETWORK_ERROR", "Network down"),
      errorCode: "NETWORK_ERROR",
      success: false,
    });
    const output = renderPaywall();
    await pressByLabel(output, "Restore purchases");

    expect(mockRestore).toHaveBeenCalled();
    expect(containsText(output, "Restore did not complete")).toBe(true);
    expect(
      containsText(
        output,
        "If you already subscribed, try again on a stronger connection or sign in with the same store account.",
      ),
    ).toBe(true);
  });
});
