import type { DeepLinkPath } from "./deep-link-types";
import type { NotificationAction } from "./notification-routing-types";

export function deepLinkToNotificationAction(
  path: DeepLinkPath,
  params: Record<string, string>,
): NotificationAction {
  switch (path) {
    case "session":
      return { type: "start_session", payload: { presetId: params.presetId } };
    case "boss":
      return { type: "view_boss" };
    case "duels":
      return { type: "join_duel", payload: { duelId: params.duelId } };
    case "squad":
      return { type: "view_squad", payload: { squadId: params.squadId } };
    case "profile":
      return { type: "view_profile", payload: { userId: params.userId } };
    case "invite":
      return { type: "accept_invite", payload: { inviteCode: params.code } };
    case "study":
      return {
        type: "start_session",
        payload: { presetMode: "STUDY", source: "content-study" },
      };
    case "settings":
      return { type: "view_progress" };
    case "coach":
      return { type: "open_coach" };
    case "shop":
      return { type: "open_shop" };
    default:
      return { type: "custom", payload: { screen: path, params } };
  }
}
