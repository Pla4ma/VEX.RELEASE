import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

const styles = createSheet({
  container: {
    backgroundColor: launchColors.hex_1a1a2e,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    boxShadow: "0px 4px 8px rgba(0,0,0,0.3)",
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: launchColors.hex_e94560,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { color: launchColors.hex_fff, fontSize: 12, fontWeight: "600" },
  timerContainer: { alignItems: "center", marginVertical: 24 },
  timer: {
    fontSize: 64,
    fontWeight: "200",
    color: launchColors.hex_fff,
    fontVariant: ["tabular-nums"],
  },
  timerLabel: { fontSize: 14, color: launchColors.hex_9e9e9e, marginTop: 4 },
  progressContainer: { marginVertical: 16 },
  progressBar: {
    height: 8,
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: {
    fontSize: 12,
    color: launchColors.hex_9e9e9e,
    textAlign: "center",
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: launchColors.hex_2a2a3e,
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700", color: launchColors.hex_fff },
  statLabel: { fontSize: 12, color: launchColors.hex_9e9e9e, marginTop: 4 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  primaryButton: { backgroundColor: launchColors.hex_4caf50 },
  secondaryButton: { backgroundColor: launchColors.hex_ffa500 },
  dangerButton: { backgroundColor: launchColors.hex_e94560 },
  buttonText: { color: launchColors.hex_fff, fontSize: 16, fontWeight: "600" },
  loadingText: {
    color: launchColors.hex_9e9e9e,
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: launchColors.hex_e94560,
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    color: launchColors.hex_9e9e9e,
    fontSize: 18,
    textAlign: "center",
  },
  emptySubtext: {
    color: launchColors.hex_666,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});

export default styles;
