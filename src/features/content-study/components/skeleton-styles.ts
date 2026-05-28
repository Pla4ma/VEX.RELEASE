import { StyleSheet } from "react-native";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

export const styles = createSheet({
  container: { overflow: "hidden" },
  shimmer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: launchColors.rgb_255_255_255_0_2,
    width: "30%",
  },
  card: { borderRadius: 16, padding: 20, margin: 16 },
  header: { flexDirection: "row", alignItems: "center" },
  headerText: { marginLeft: 12, flex: 1 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  taskList: { marginTop: 12 },
  taskItem: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  taskText: { marginLeft: 12, flex: 1 },
  quizList: { marginTop: 12 },
  quizItem: { marginTop: 16, padding: 12, borderRadius: 8 },
  options: { marginTop: 8 },
  list: { padding: 16 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemIcon: { marginRight: 12 },
  itemContent: { flex: 1 },
  extractionCard: { borderRadius: 16, padding: 20, margin: 16 },
  extractionHeader: { flexDirection: "row", alignItems: "center" },
  extractionText: { marginLeft: 12, flex: 1 },
  stages: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  stage: { alignItems: "center" },
});
