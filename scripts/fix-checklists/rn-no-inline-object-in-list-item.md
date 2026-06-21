# rn-no-inline-object-in-list-item — manual fix checklist

Diagnostics found: **10**.

Estimated human time: 3-5 minutes.

## Per-file fixes

### src/screens/profile/AchievementSearchFilter.tsx

- L60: This object is rebuilt for every row, so your memo() rows still redraw.
- L63: This object is rebuilt for every row, so your memo() rows still redraw.

### src/screens/search/components/CategoriesBar.tsx

- L34: This object is rebuilt for every row, so your memo() rows still redraw.
- L58: This object is rebuilt for every row, so your memo() rows still redraw.
- L62: This object is rebuilt for every row, so your memo() rows still redraw.

### src/screens/search/components/SearchResults.tsx

- L45: This object is rebuilt for every row, so your memo() rows still redraw.
- L55: This object is rebuilt for every row, so your memo() rows still redraw.
- L81: This object is rebuilt for every row, so your memo() rows still redraw.

### src/screens/session/components/SessionThemeSelector.tsx

- L102: This object is rebuilt for every row, so your memo() rows still redraw.
- L115: This object is rebuilt for every row, so your memo() rows still redraw.
