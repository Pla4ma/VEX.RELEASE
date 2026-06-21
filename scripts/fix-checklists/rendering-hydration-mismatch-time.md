# rendering-hydration-mismatch-time — manual fix checklist

Diagnostics found: **11**.

Estimated human time: 3-6 minutes.

## Per-file fixes

### src/features/analytics/components/DashboardContent.tsx

- L86: This can cause a hydration mismatch because Date.
- L86: This can cause a hydration mismatch because Date.

### src/features/analytics/components/DataExportScreen.tsx

- L160: This can cause a hydration mismatch because Date.
- L160: This can cause a hydration mismatch because Date.

### src/features/focus-identity/FocusScoreDashboard-main.tsx

- L150: This can cause a hydration mismatch because new Date() reached from JSX gives a different value on the server than in the browser.

### src/features/monthly-report/components/ReportContent.tsx

- L39: This can cause a hydration mismatch because Date.
- L39: This can cause a hydration mismatch because Date.

### src/features/notifications/components/WeeklyReportCardView.tsx

- L71: This can cause a hydration mismatch because new Date() reached from JSX gives a different value on the server than in the browser.

### src/features/settings/components/SettingsDataControlSection.tsx

- L31: This can cause a hydration mismatch because Date.

### src/screens/auth/components/VexEditorialMark.tsx

- L121: This can cause a hydration mismatch because new Date() reached from JSX gives a different value on the server than in the browser.

### src/shared/ui/primitives/Skeleton.tsx

- L157: This can cause a hydration mismatch because Math.
