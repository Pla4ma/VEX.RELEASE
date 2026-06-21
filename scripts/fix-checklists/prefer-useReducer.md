# prefer-useReducer — manual fix checklist

Diagnostics found: **3**.

Estimated human time: 9-24 minutes.

## Per-file fixes

### src/screens/auth/ResetPasswordScreen.tsx

- L23: 5 useState calls in "ResetPasswordScreen" can each trigger a separate render.

### src/screens/auth/VerifyEmailScreen.tsx

- L24: 6 useState calls in "VerifyEmailScreen" can each trigger a separate render.

### src/screens/search/SearchScreen.tsx

- L17: 6 useState calls in "SearchScreen" can each trigger a separate render.
