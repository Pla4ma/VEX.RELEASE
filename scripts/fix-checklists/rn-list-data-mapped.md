# rn-list-data-mapped — manual fix checklist

Diagnostics found: **1**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/screens/profile/AchievementsScreen.tsx

- L77: Your users see every row redraw when <FlashList> gets a new data array each render.
