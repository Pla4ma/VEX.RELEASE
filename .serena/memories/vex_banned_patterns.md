# VEX Banned Patterns

Hard limits:
- Every hand-edited file must stay under 200 lines. Split before exceeding.
- No any, as any, z.any, @ts-ignore, @ts-nocheck.
- No console.log. Use logger/Sentry breadcrumbs.
- No TODO in shipped code.
- No StyleSheet.create.
- No FlatList; use FlashList with accurate estimatedItemSize.
- No AsyncStorage; use MMKV or SecureStorage wrapper as appropriate.
- No raw fetch; use existing API client.
- No hardcoded colors, spacing, font sizes, or radii.
- No stubs/fake placeholders that look complete.
- No success-only UI or happy-path-only async flows.

All async functions need explicit return types and typed error handling. Repository failures should surface typed errors and parse data at Zod boundaries.
