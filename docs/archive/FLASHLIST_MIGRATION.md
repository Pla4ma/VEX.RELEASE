# FlashList Migration Guide

## Phase 7A.1 — FlashList Audit & Migration

### Installation

```bash
npm install @shopify/flash-list
```

### Components Requiring FlashList Migration

| Component | Current | Status | Priority |
|-----------|---------|--------|----------|
| `DataList.tsx` | FlatList | NEEDS MIGRATION | HIGH |
| `SessionHistory.tsx` | ScrollView | NEEDS MIGRATION | HIGH |
| `SessionPresets.tsx` | FlatList | NEEDS MIGRATION | MEDIUM |
| `crafting-item-grid.tsx` | ScrollView | NEEDS MIGRATION | MEDIUM |
| `wallet-screen.tsx` | FlatList | NEEDS MIGRATION | MEDIUM |
| `ProgressScreen.tsx` | FlatList | NEEDS MIGRATION | MEDIUM |
| `ProfileScreen.tsx` | FlatList | NEEDS MIGRATION | LOW |
| `SquadInviteFlow.tsx` | FlatList | NEEDS MIGRATION | LOW |
| `SquadMissionCard.tsx` | FlatList | NEEDS MIGRATION | LOW |
| `SettingsScreen.tsx` | FlatList | NEEDS MIGRATION | LOW |
| `Heatmap.tsx` | FlatList | NEEDS MIGRATION | LOW |

### Migration Steps

1. Replace import:
   ```typescript
   // Before
   import { FlatList } from 'react-native';
   
   // After
   import { FlashList } from '@shopify/flash-list';
   ```

2. Add `estimatedItemSize` prop (REQUIRED for FlashList):
   ```typescript
   <FlashList
     data={items}
     renderItem={renderItem}
     estimatedItemSize={80} // Required!
   />
   ```

3. Remove `getItemLayout` (not needed with FlashList):
   ```typescript
   // Remove this:
   getItemLayout={(_, index) => ({
     length: ITEM_HEIGHT,
     offset: ITEM_HEIGHT * index,
     index,
   })}
   ```

4. Ensure `keyExtractor` is stable

### Performance Targets

- 60fps scroll on mid-range Android (Pixel 4a / Samsung A51)
- Memory usage < 150MB for lists with 1000+ items
- No dropped frames during fast scroll

### Testing Checklist

- [ ] Scroll through 50+ items smoothly
- [ ] No white/blank gaps during scroll
- [ ] Pull-to-refresh works
- [ ] Infinite scroll (onEndReached) works
- [ ] No layout shifts when items load
