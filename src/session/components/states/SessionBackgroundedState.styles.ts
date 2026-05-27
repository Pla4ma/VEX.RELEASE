import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

export const styles = createSheet({
  container: { alignItems: "center" },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  icon: { fontSize: 40 },
  impactCard: { width: "100%" },
  progressBar: {
    height: 8,
    backgroundColor: launchColors.rgb_0_0_0_0_1,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  warningBox: {
    backgroundColor: launchColors.rgb_245_158_11_0_1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: launchColors.rgb_245_158_11_0_3,
  },
});
