# rn-no-inline-flatlist-renderitem — manual fix checklist

Diagnostics found: **7**.

Estimated human time: 2-4 minutes.

## Per-file fixes

### src/screens/notifications/NotificationsScreen.tsx

- L128: Your users see extra row work when renderItem on <FlashList> is rebuilt every time the screen redraws.

### src/screens/profile/AchievementSearchFilter.tsx

- L41: Your users see extra row work when renderItem on <FlashList> is rebuilt every time the screen redraws.

### src/screens/profile/AchievementsScreen.tsx

- L78: Your users see extra row work when renderItem on <FlashList> is rebuilt every time the screen redraws.
- L133: Your users see extra row work when renderItem on <FlashList> is rebuilt every time the screen redraws.

### src/screens/search/components/CategoriesBar.tsx

- L32: Your users see extra row work when renderItem on <FlashList> is rebuilt every time the screen redraws.

### src/screens/search/components/SearchResults.tsx

- L43: Your users see extra row work when renderItem on <FlashList> is rebuilt every time the screen redraws.

### src/screens/session/components/SessionThemeSelector.tsx

- L86: Your users see extra row work when renderItem on <FlashList> is rebuilt every time the screen redraws.
