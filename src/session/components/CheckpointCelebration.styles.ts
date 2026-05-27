import { launchColors } from "@theme/tokens/launch-colors";

export const overlayStyle = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  zIndex: 100,
  backgroundColor: launchColors.rgb_0_0_0_0_3,
};

export const particleContainerStyle = {
  position: "absolute" as const,
  top: "50%" as const,
  left: "50%" as const,
  width: 1,
  height: 1,
};

export const particleStyle = { position: "absolute" as const, borderRadius: 50 };

export const cardStyle = {
  padding: 32,
  borderRadius: 24,
  alignItems: "center" as const,
  shadowColor: launchColors.hex_000,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
  minWidth: 280,
};

export const emojiContainerStyle = { marginBottom: 16 };
export const emojiTextStyle = { fontSize: 64 };
export const titleStyle = { marginBottom: 8, textAlign: "center" as const };
export const subtitleStyle = { textAlign: "center" as const, marginBottom: 16 };

export const bonusBadgeStyle = {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  marginTop: 8,
};

export const bonusTextStyle = {
  color: launchColors.hex_fff,
  fontWeight: "700" as const,
  fontSize: 14,
};

export const progressContainerStyle = {
  width: 200,
  height: 8,
  backgroundColor: launchColors.rgb_0_0_0_0_1,
  borderRadius: 4,
  marginTop: 12,
  overflow: "hidden" as const,
};

export const progressBarStyle = { height: "100%" as const, borderRadius: 4 };
