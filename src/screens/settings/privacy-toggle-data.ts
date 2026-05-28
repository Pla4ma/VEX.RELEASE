export type ToggleKey = "activitySharing" | "squadFeed" | "analytics";

export const TOGGLE_ROWS: {
  key: ToggleKey;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    key: "activitySharing",
    title: "Activity Sharing",
    description: "Show completed sessions to approved social surfaces.",
    icon: "users",
  },
  {
    key: "squadFeed",
    title: "Squad Feed Visibility",
    description: "Allow eligible squad members to see your focus activity.",
    icon: "message-circle",
  },
  {
    key: "analytics",
    title: "Privacy-Safe Analytics",
    description: "Share usage patterns after private fields are stripped.",
    icon: "bar-chart-2",
  },
];
