import { StyleSheet } from "react-native";
import { createSheet } from "@/shared/ui/create-sheet";

export const overlayStyles = createSheet({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { alignItems: "center", padding: 32 },
  message: { marginTop: 16, fontSize: 16, fontWeight: "500" },
  progressContainer: { marginTop: 16, width: 200 },
  progressBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { marginTop: 8, fontSize: 12, textAlign: "center" },
  buttonLoading: { flexDirection: "row", alignItems: "center", gap: 8 },
  buttonLoadingText: { fontSize: 14 },
});

export const sectionStyles = createSheet({
  sectionContainer: { padding: 16 },
  sectionItem: { marginBottom: 12 },
});

export const progressStyles = createSheet({
  progressOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  progressContent: { width: "80%", maxWidth: 300, alignItems: "center" },
  progressBarLarge: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFillLarge: { height: "100%", borderRadius: 4 },
  progressMessage: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  progressSubmessage: { fontSize: 14, marginBottom: 8, textAlign: "center" },
  progressPercentage: { fontSize: 24, fontWeight: "700" },
});
