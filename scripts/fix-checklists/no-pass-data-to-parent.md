# no-pass-data-to-parent — manual fix checklist

Diagnostics found: **5**.

Estimated human time: 2-3 minutes.

## Per-file fixes

### src/features/content-study/components/YouTubeInput.tsx

- L43: Handing data back to a parent from a useEffect costs your users an extra render.

### src/features/content-study/components/useTextPasteInput.ts

- L53: Handing data back to a parent from a useEffect costs your users an extra render.

### src/hooks/usePaginatedApi.ts

- L56: Handing data back to a parent from a useEffect costs your users an extra render.

### src/screens/home/hooks/useHomeReturnReason.ts

- L78: Handing data back to a parent from a useEffect costs your users an extra render.

### src/shared/ui/PremiumErrorRecovery.tsx

- L118: Handing data back to a parent from a useEffect costs your users an extra render.
