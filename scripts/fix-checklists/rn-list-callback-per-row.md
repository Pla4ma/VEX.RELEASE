# rn-list-callback-per-row — manual fix checklist

Diagnostics found: **5**.

Estimated human time: 2-3 minutes.

## Per-file fixes

### src/screens/profile/AchievementSearchFilter.tsx

- L45: This onPress is rebuilt for every row, so your memo() rows still redraw.

### src/screens/profile/AchievementsScreen.tsx

- L134: This onPress is rebuilt for every row, so your memo() rows still redraw.

### src/screens/search/components/CategoriesBar.tsx

- L45: This onPress is rebuilt for every row, so your memo() rows still redraw.

### src/screens/search/components/SearchResults.tsx

- L47: This onPress is rebuilt for every row, so your memo() rows still redraw.

### src/screens/session/components/SessionThemeSelector.tsx

- L92: This onPress is rebuilt for every row, so your memo() rows still redraw.
