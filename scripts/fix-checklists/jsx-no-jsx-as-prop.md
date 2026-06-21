# jsx-no-jsx-as-prop — manual fix checklist

Diagnostics found: **7**.

Estimated human time: 2-4 minutes.

## Per-file fixes

### src/features/analytics/components/AnalyticsDashboard.tsx

- L149: This child redraws every render because the prop gets brand new JSX each time.

### src/features/challenges/components/ChallengeList.tsx

- L138: This child redraws every render because the prop gets brand new JSX each time.

### src/features/monthly-report/components/MonthlyFocusReportScreen.tsx

- L130: This child redraws every render because the prop gets brand new JSX each time.

### src/features/settings/components/SettingsScreen.tsx

- L144: This child redraws every render because the prop gets brand new JSX each time.

### src/screens/notifications/NotificationsScreen.tsx

- L145: This child redraws every render because the prop gets brand new JSX each time.

### src/screens/session/components/SessionSetupReturningUserView.tsx

- L129: This child redraws every render because the prop gets brand new JSX each time.

### src/shared/ui/components/DataList.tsx

- L129: This child redraws every render because the prop gets brand new JSX each time.
