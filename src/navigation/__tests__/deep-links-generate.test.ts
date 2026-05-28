import {
  deepLinkToNotificationAction,
  generateDeepLink,
  generateInviteLink,
  generateProfileShareLink,
  generateSessionShareLink,
  handleDeepLinkWithFallback,
  validateInviteCode,
} from "../deep-links";
describe("Deep Links – generation, validation, and actions", () => {
  describe("generateDeepLink", () => {
    it("generates URL without params", () => {
      const url = generateDeepLink("boss");
      expect(url).toBe("vex://boss");
    });
    it("generates URL with params", () => {
      const url = generateDeepLink("session", { presetId: "123" });
      expect(url).toBe("vex://session?presetId=123");
    });
    it("generates URL with multiple params", () => {
      const url = generateDeepLink("profile", { userId: "123", tab: "stats" });
      expect(url).toContain("vex://profile");
      expect(url).toContain("userId=123");
      expect(url).toContain("tab=stats");
    });
  });
  describe("generateInviteLink", () => {
    it("generates squad invite link", () => {
      const url = generateInviteLink("squad-123", "ABC12345");
      expect(url).toContain("https://vex.app/invite/squad/squad-123");
      expect(url).toContain("code=ABC12345");
    });
  });
  describe("generateSessionShareLink", () => {
    it("generates session share link", () => {
      const url = generateSessionShareLink("session-123");
      expect(url).toBe("https://vex.app/session/session-123");
    });
  });
  describe("generateProfileShareLink", () => {
    it("generates profile share link", () => {
      const url = generateProfileShareLink("user-123");
      expect(url).toBe("https://vex.app/profile/user-123");
    });
  });
  describe("validateInviteCode", () => {
    it("validates 8-character uppercase code", () => {
      expect(validateInviteCode("ABC12345")).toBe(true);
      expect(validateInviteCode("12345678")).toBe(true);
      expect(validateInviteCode("ABCDEFGH")).toBe(true);
    });
    it("rejects lowercase code", () => {
      expect(validateInviteCode("abc12345")).toBe(false);
    });
    it("rejects short code", () => {
      expect(validateInviteCode("ABC1234")).toBe(false);
    });
    it("rejects long code", () => {
      expect(validateInviteCode("ABC123456")).toBe(false);
    });
    it("rejects code with special characters", () => {
      expect(validateInviteCode("ABC-1234")).toBe(false);
    });
  });
  describe("handleDeepLinkWithFallback", () => {
    const mockHandlers = {
      onValid: jest.fn(),
      onInvalid: jest.fn(),
      onUnsupported: jest.fn(),
    };
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("calls onValid for valid link", () => {
      handleDeepLinkWithFallback("vex://boss", mockHandlers);
      expect(mockHandlers.onValid).toHaveBeenCalled();
      expect(mockHandlers.onInvalid).not.toHaveBeenCalled();
      expect(mockHandlers.onUnsupported).not.toHaveBeenCalled();
    });
    it("calls onInvalid for invalid URL", () => {
      handleDeepLinkWithFallback("not-a-url", mockHandlers);
      expect(mockHandlers.onInvalid).toHaveBeenCalled();
      expect(mockHandlers.onValid).not.toHaveBeenCalled();
    });
    it("calls onInvalid for invalid URL structure", () => {
      handleDeepLinkWithFallback("ftp://invalid.com/path", mockHandlers);
      expect(mockHandlers.onInvalid).toHaveBeenCalled();
    });
  });
  describe("deepLinkToNotificationAction", () => {
    it("converts session path", () => {
      const action = deepLinkToNotificationAction("session", {
        presetId: "123",
      });
      expect(action.type).toBe("start_session");
      expect(action.payload?.presetId).toBe("123");
    });
    it("converts boss path", () => {
      const action = deepLinkToNotificationAction("boss", {});
      expect(action.type).toBe("view_boss");
    });
    it("converts duels path", () => {
      const action = deepLinkToNotificationAction("duels", { duelId: "123" });
      expect(action.type).toBe("join_duel");
      expect(action.payload?.duelId).toBe("123");
    });
    it("converts squad path", () => {
      const action = deepLinkToNotificationAction("squad", {
        squadId: "squad-123",
      });
      expect(action.type).toBe("view_squad");
      expect(action.payload?.squadId).toBe("squad-123");
    });
    it("converts profile path", () => {
      const action = deepLinkToNotificationAction("profile", {
        userId: "user-123",
      });
      expect(action.type).toBe("view_profile");
      expect(action.payload?.userId).toBe("user-123");
    });
    it("converts invite path", () => {
      const action = deepLinkToNotificationAction("invite", {
        code: "ABC12345",
        squadId: "squad-123",
      });
      expect(action.type).toBe("accept_invite");
      expect(action.payload?.inviteCode).toBe("ABC12345");
    });
    it("converts shop path", () => {
      const action = deepLinkToNotificationAction("shop", {});
      expect(action.type).toBe("open_shop");
    });
    it("converts coach path", () => {
      const action = deepLinkToNotificationAction("coach", {});
      expect(action.type).toBe("open_coach");
    });
    it("converts study path", () => {
      const action = deepLinkToNotificationAction("study", {});
      expect(action.type).toBe("start_session");
    });
    it("converts settings path", () => {
      const action = deepLinkToNotificationAction("settings", {});
      expect(action.type).toBe("view_progress");
    });
  });
});
