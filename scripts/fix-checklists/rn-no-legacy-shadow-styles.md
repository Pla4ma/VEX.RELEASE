# rn-no-legacy-shadow-styles — manual fix checklist

Diagnostics found: **6**.

Estimated human time: 2-3 minutes.

## Per-file fixes

### src/components/glass/GlassCard.tsx

- L61: Shadow style "elevation" only work on one platform, so your users on the other see no shadow.

### src/features/achievements/components/AchievementDetailIcon.tsx

- L50: Shadow style "elevation" only work on one platform, so your users on the other see no shadow.

### src/features/ai-coach/components/CoachSessionBanner.tsx

- L104: Shadow style "elevation" only work on one platform, so your users on the other see no shadow.

### src/features/capture/components/CaptureSheet.tsx

- L53: Shadow styles "shadowColor", "shadowRadius", "shadowOffset", "shadowOpacity", "elevation" only work on one platform, so your users on the other see no shadow.

### src/features/notifications/components/WeeklyReportCardView.tsx

- L56: Shadow styles "shadowColor", "shadowOffset", "shadowOpacity", "shadowRadius", "elevation" only work on one platform, so your users on the other see no shadow.

### src/features/session-start/components/ModeCardItem.tsx

- L43: Shadow styles "shadowColor", "shadowOffset", "shadowOpacity", "shadowRadius" only work on one platform, so your users on the other see no shadow.
