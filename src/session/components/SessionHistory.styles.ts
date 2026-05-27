import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

export const styles = createSheet({
  container: { flex: 1, backgroundColor: launchColors.hex_1a1a2e },
  loadingText: {
    color: launchColors.hex_9e9e9e,
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  statsHeader: { flexDirection: "row", padding: 16, gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: "700",
    color: launchColors.hex_fff,
  },
  statBoxLabel: { fontSize: 12, color: launchColors.hex_9e9e9e, marginTop: 4 },
  searchInput: {
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    color: launchColors.hex_fff,
    fontSize: 16,
  },
  filterRow: { marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  filterChipActive: { backgroundColor: launchColors.hex_e94560 },
  filterChipText: {
    color: launchColors.hex_9e9e9e,
    fontSize: 12,
    fontWeight: "500",
  },
  filterChipTextActive: { color: launchColors.hex_fff },
  list: { flex: 1 },
  emptyState: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 18, color: launchColors.hex_9e9e9e, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: launchColors.hex_666 },
});
