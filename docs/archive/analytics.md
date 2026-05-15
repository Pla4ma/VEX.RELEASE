# Analytics Rules & Standards

Strict analytics guidelines for the VEX codebase.

---

## Analytics Philosophy

- **Track meaningful user behavior, not noise**
- **Every event must answer a product question**
- **Avoid over-tracking** - fewer, better events > many meaningless events
- **Respect user privacy** - no sensitive data collection
- **Analytics must not break the app** - all calls are fire-and-forget

---

## Core Events (REQUIRED)

These events are the foundation of our analytics. All must be implemented.

### Auth Events
```typescript
AuthEvents.USER_SIGNED_UP      // New user registration
AuthEvents.USER_LOGGED_IN      // Successful login
AuthEvents.USER_LOGGED_OUT     // User logout
```

**Required Properties:**
- `user_id` - Anonymous until login, then authenticated ID
- `method` - 'email' | 'google' | 'apple' | 'anonymous'
- `is_new_user` - boolean (for sign up)

### Session Events
```typescript
SessionEvents.SESSION_STARTED     // User begins focus session
SessionEvents.SESSION_COMPLETED   // Normal completion
SessionEvents.SESSION_ABANDONED   // Abnormal termination
```

**Required Properties:**
- `session_id` - Unique session identifier
- `session_type` - 'focus' | 'boss' | 'challenge'
- `duration_seconds` - Total time in seconds
- `completion_percentage` - 0-100
- `xp_earned` - Amount earned
- `coins_earned` - Amount earned

### Progression Events
```typescript
ProgressionEvents.XP_GAINED                 // Any XP award
ProgressionEvents.LEVEL_UP                 // Level milestone
ProgressionEvents.STREAK_UPDATED           // Streak change
ProgressionEvents.ACHIEVEMENT_UNLOCKED     // Achievement earned
```

**Required Properties:**
- `xp_amount` - For XP events
- `previous_level` / `new_level` - For level up
- `streak_days` - For streak events
- `achievement_id` - For achievements

### Economy Events
```typescript
EconomyEvents.REWARD_CLAIMED    // User claims reward
EconomyEvents.ITEM_PURCHASED   // Shop purchase
EconomyEvents.CURRENCY_EARNED   // Any currency gain
EconomyEvents.CURRENCY_SPENT    // Any currency loss
```

**Required Properties:**
- `currency_type` - 'coins' | 'gems' | 'seasonal'
- `amount` - Numeric value
- `item_id` / `item_name` - For purchases
- `source` - Where the currency came from
- `balance_after` - Running balance

### Social Events
```typescript
SocialEvents.SQUAD_JOINED       // Join squad
SocialEvents.ACTIVITY_POSTED    // Post to feed
```

**Required Properties:**
- `squad_id` / `squad_name` - For squad events
- `post_type` - For activity posts

---

## Event Rules

### Naming Convention
```typescript
// ✅ Use snake_case
user_signed_up
session_completed
level_up

// ❌ DON'T use camelCase or inline strings
userSignedUp
'some-random-event'
```

### Event Names Must Be Constants
```typescript
// ✅ Use constant from analytics-events.ts
track(SessionEvents.SESSION_STARTED, { ... })

// ❌ NEVER use inline strings
track('session_started', { ... })  // FORBIDDEN
track(`session_${type}`, { ... })    // FORBIDDEN
```

### Required Metadata
Every event must include:
```typescript
{
  user_id: string;           // Anonymous or authenticated
  session_id?: string;       // Current session if applicable
  timestamp: number;         // Auto-added by service
  outcome?: 'success' | 'failure';
  error_message?: string;    // Only on failure
}
```

### Optional Context
Include when relevant:
```typescript
{
  platform: 'ios' | 'android' | 'web';
  app_version: string;
  feature_flag_enabled?: boolean;
}
```

---

## What NOT to Track

### Forbidden: UI Noise
```typescript
// ❌ DON'T track meaningless clicks
track('button_clicked')  // Which button? Why?
track('screen_tapped')   // Too generic
track('menu_opened')     // Unless it's a key feature
```

### Forbidden: Duplicate Events
```typescript
// ❌ DON'T track the same action multiple ways
// If tracking SESSION_COMPLETED, don't also track:
track('timer_finished')
track('focus_ended')
track('session_done')
```

### Forbidden: Sensitive Data
```typescript
// ❌ NEVER track these:
- Passwords or credentials
- Exact GPS location
- Personal messages content
- Financial account details
- Health data not related to app usage

// ✅ DO track:
- General location (city/country level)
- Feature usage patterns
- Performance metrics
```

### Forbidden: Every Button Press
```typescript
// ❌ DON'T track every interaction
track('plus_button_clicked')
track('minus_button_clicked')
track('close_button_clicked')

// ✅ DO track meaningful actions
track(ProgressionEvents.XP_GAINED, { amount: 100, source: 'quest' })
```

---

## User Identification

### Identify After Login
```typescript
// ✅ Call identify after successful auth
const { identifyUser } = useAnalytics();

useEffect(() => {
  if (user?.id) {
    identifyUser(user.id, {
      level: user.level,
    });
  }
}, [user]);
```

### Reset on Logout
```typescript
// ✅ Call reset on logout
const { resetUser } = useAnalytics();

const handleLogout = () => {
  await auth.signOut();
  resetUser();  // Clears analytics identity
};
```

### Anonymous Tracking
```typescript
// ✅ Track events before login (anonymous)
// PostHog automatically handles anonymous ID
// Just don't call identify() until user logs in
```

---

## Error Tracking

### Errors Go to Sentry
```typescript
// ❌ DON'T send errors to PostHog
capture('error_occurred', { error: err.message })

// ✅ DO send to Sentry
Sentry.captureException(err);
```

### Analytics Failures Are Silent
```typescript
// ✅ Analytics errors don't break the app
try {
  analytics.capture(event, properties);
} catch {
  // Silently fail - app continues working
}
```

---

## Integration Rules

### Analytics Trigger Points

#### ✅ From Service Layer
```typescript
// In service.ts
import { capture, EconomyEvents } from '@/shared/analytics';

export async function addCurrency(input: AddCurrencyInput) {
  // ... logic ...
  
  capture(EconomyEvents.CURRENCY_EARNED, {
    currency_type: input.currency,
    amount: input.amount,
    source: input.source,
    balance_after: newBalance,
  });
}
```

#### ✅ From Hooks
```typescript
// In custom hook
export function useSessionTimer() {
  const { trackSession } = useAnalytics();
  
  const completeSession = () => {
    // ... logic ...
    trackSession(SessionEvents.SESSION_COMPLETED, {
      duration_seconds: elapsed,
      completion_percentage: 100,
    });
  };
}
```

#### ❌ NOT Directly in UI Components
```typescript
// ❌ DON'T track directly in JSX/onPress
<Button 
  onPress={() => {
    track('button_pressed');  // FORBIDDEN
    doSomething();
  }}
/>

// ✅ DO track via hook or service
const handlePress = () => {
  doSomething();  // Service layer tracks internally
};
```

---

## Quality Rules

### No Anonymous Magic Events
```typescript
// ❌ FORBIDDEN - event name unclear
track('event_1')
track('user_did_something')

// ✅ REQUIRED - descriptive, constant-based
track(SessionEvents.SESSION_COMPLETED)
```

### No Unused Events
```typescript
// ❌ If you define an event, use it
export const UNUSED_EVENT = 'unused';  // Don't commit this

// ✅ Remove events that aren't being tracked
```

### Every Event Maps to a Feature
```typescript
// ✅ Each event answers: "What user action happened?"
user_signed_up      → Auth feature
session_completed → Sessions feature
item_purchased    → Economy feature

// ❌ Don't create events without a feature owner
```

### Test Your Events
```typescript
// ✅ Verify events are captured in tests
it('should track session completion', () => {
  const spy = jest.spyOn(analyticsService, 'capture');
  
  await completeSession();
  
  expect(spy).toHaveBeenCalledWith(
    SessionEvents.SESSION_COMPLETED,
    expect.objectContaining({
      duration_seconds: expect.any(Number),
    })
  );
});
```

---

## File Organization

```
src/shared/analytics/
├── analytics-events.ts      # All event constants
├── analytics-service.ts       # PostHog wrapper
├── use-analytics.ts          # React hooks
└── index.ts                  # Public exports
```

---

## Usage Examples

### Basic Event Tracking
```typescript
import { useAnalytics, SessionEvents } from '@/shared/analytics';

function SessionScreen() {
  const { trackSession, trackScreen } = useAnalytics();
  
  useEffect(() => {
    trackScreen('SessionScreen');
  }, []);
  
  const handleComplete = () => {
    trackSession(SessionEvents.SESSION_COMPLETED, {
      duration_seconds: 1800,
      completion_percentage: 100,
    });
  };
}
```

### User Identification
```typescript
import { useAnalytics, AuthEvents } from '@/shared/analytics';

function useAuth() {
  const { identifyUser, resetUser, trackAuth } = useAnalytics();
  
  const login = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      
      identifyUser(user.id, {
        level: user.level,
      });
      
      trackAuth(AuthEvents.USER_LOGGED_IN, {
        method: 'email',
      });
      
      return user;
    } catch (error) {
      // Error goes to Sentry, not analytics
      throw error;
    }
  };
  
  const logout = async () => {
    await authService.logout();
    resetUser();
  };
}
```

### Service Layer Integration
```typescript
import { capture, EconomyEvents } from '@/shared/analytics';

export async function purchaseItem(input: PurchaseInput) {
  const result = await processPurchase(input);
  
  if (result.success) {
    capture(EconomyEvents.ITEM_PURCHASED, {
      item_id: input.itemId,
      item_name: result.itemName,
      currency_type: result.currency,
      amount: result.amount,
      balance_after: result.newBalance,
      outcome: 'success',
    });
  } else {
    capture(EconomyEvents.ITEM_PURCHASED, {
      item_id: input.itemId,
      outcome: 'failure',
      error_message: result.error,
    });
  }
  
  return result;
}
```

---

## Environment Variables

```bash
# Required for analytics to work
EXPO_PUBLIC_POSTHOG_KEY=phc_your_project_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
EXPO_PUBLIC_APP_VERSION=1.0.0
```

**Note:** If `EXPO_PUBLIC_POSTHOG_KEY` is not set, analytics will be silently disabled.

---

## Running Locally

Analytics are automatically disabled in development unless explicitly enabled:

```typescript
// Force enable for testing
analyticsService.initialize({ debug: true });
```

---

## Checklist

Before submitting code with analytics:

- [ ] Event name uses constant from `analytics-events.ts`
- [ ] Event uses `snake_case` naming
- [ ] Required properties included
- [ ] No sensitive data in properties
- [ ] No inline string event names
- [ ] Analytics called from service/hook layer, not UI
- [ ] Error handling doesn't break app
- [ ] User identification happens after login
- [ ] Reset called on logout

---

**Last Updated:** 2024-01-18  
**Owner:** Product Team  
**Enforced:** CI/CD + Code Review
