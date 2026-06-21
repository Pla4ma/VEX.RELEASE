# js-min-max-loop — manual fix checklist

Diagnostics found: **7**.

Estimated human time: 2-4 minutes.

## Per-file fixes

### src/features/content-study/hooks/useCompleteStudyPlanTask.ts

- L32: This is slow because array.

### src/features/notifications/SmartNotificationSystem.ts

- L52: This is slow because array.

### src/features/personalization/experience-service-helpers.ts

- L50: This is slow because array.

### src/screens/home/hooks/useActivatingHomeModel.ts

- L86: This is slow because array.

### src/screens/home/hooks/useEngagedQueries.ts

- L51: This is slow because array.

### src/screens/home/hooks/useHomeScreenController.helpers.ts

- L8: This is slow because array.

### src/screens/home/hooks/usePowerUserHomeModel.ts

- L73: This is slow because array.
