import { createSheet } from "@/shared/ui/create-sheet";
import type { ToastType } from "./Toast.types";

export const styles = createSheet({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  toastContainer: {
    width: "100%",
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    minHeight: 64,
  },
  iconContainer: { marginRight: 12 },
  content: { flex: 1 },
  title: { fontWeight: "600" },
  message: { marginTop: 2, opacity: 0.9 },
  action: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dismissButton: { marginLeft: 12, padding: 4 },
  progressBar: { height: 3 },
});

interface ToastTypeStyle {
  backgroundColor: string;
  icon: string;
}

const TYPE_FALLBACKS: Record<ToastType, string> = {
  success: "check-circle",
  error: "alert-circle",
  warning: "alert-triangle",
  info: "info",
};

export function getToastTypeStyle(
  type: ToastType | undefined,
  iconOverride: string | undefined,
  themeColors: {
    success: { DEFAULT: string };
    error: { DEFAULT: string };
    warning: { DEFAULT: string };
    primary: { 500: string };
  },
): ToastTypeStyle {
  const fallback = type ?? "info";
  const icon = iconOverride ?? TYPE_FALLBACKS[fallback];
  switch (type) {
    case "success":
      return { backgroundColor: themeColors.success.DEFAULT, icon };
    case "error":
      return { backgroundColor: themeColors.error.DEFAULT, icon };
    case "warning":
      return { backgroundColor: themeColors.warning.DEFAULT, icon };
    case "info":
    default:
      return { backgroundColor: themeColors.primary[500], icon };
  }
}
