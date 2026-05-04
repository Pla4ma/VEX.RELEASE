# Session Story Integration Guide

## Quick Integration

Add the Story Moment to your Session Complete screen in 3 steps:

### Step 1: Import
```typescript
// In SessionCompleteContent.tsx
import { StoryMoment, useSessionStory } from '@/features/session-story';
import type { SessionStory } from '@/features/session-story';
```

### Step 2: Add State and Hook
```typescript
export function SessionCompleteContent({
  sessionId,
  summary,
  consequences,
}: SessionCompleteContentProps) {
  // ... existing code ...
  
  // Add story state
  const [showStory, setShowStory] = useState(true);
  const { story, isLoading } = useSessionStory(sessionId, controller.userId ?? '');
  
  // ... rest of component ...
}
```

### Step 3: Insert Story Moment
```typescript
return (
  <ScrollView>
    {/* Grade Reveal Animation */}
    <GradeRevealAnimation ... />
    
    {/* STORY MOMENT - INSERT HERE */}
    {showStory && story && (
      <StoryMoment
        story={story}
        onComplete={() => setShowStory(false)}
        onSkip={() => setShowStory(false)}
      />
    )}
    
    {/* Rest of content shows after story */}
    {!showStory && (
      <>
        <XPEarnAnimation ... />
        <SessionCompletionRewardsSection ... />
        {/* ... etc ... */}
      </>
    )}
  </ScrollView>
);
```

## Alternative: Event-Based Integration

If you prefer to keep StoryMoment separate:

```typescript
// In your navigation or app initialization
import { initializeSessionStoryEngine } from '@/features/session-story';

// Start listening for session:story:ready events
const unsubscribe = initializeSessionStoryEngine();

// When event fires, navigate to story screen
eventBus.subscribe('session:story:ready', (event) => {
  navigation.navigate('StoryMoment', {
    storyId: event.storyId,
    sessionId: event.sessionId,
  });
});
```

## Database Setup

Run the migration to create the `session_stories` table:

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Run SQL directly in Supabase Dashboard
# Copy contents of: supabase/migrations/20260501_session_stories.sql
```

## Feature Flag (Optional)

Add to your feature flags:

```typescript
// In your feature flag config
{
  id: 'session_story_enabled',
  name: 'Post-Session Story Moment',
  description: 'Show cinematic story after session completion',
  defaultValue: true,
  rolloutPercentage: 100,
}
```

Then use in component:
```typescript
const showStoryFeature = useFeatureFlag('session_story_enabled');

{showStoryFeature && showStory && story && (
  <StoryMoment ... />
)}
```

## Testing

Run the test suite:

```bash
# Test story generation
npm test -- StoryBeatCalculator.test.ts

# Test emotion retention
npm test -- EmotionRetentionEngine.test.ts

# Run all tests
npm test
```

## Complete Implementation Status

| Feature | Status | Tests |
|---------|--------|-------|
| Story Generation | ✅ Complete | 18 tests |
| Emotion Retention | ✅ Complete | 42 tests |
| Event System | ✅ Complete | Integrated |
| Database | ✅ Migration ready | - |
| UI Component | ✅ Ready | StoryMoment.tsx |
| Integration | ✅ Documented | See above |

**Total Lines of Code Added:** ~2,500 lines
**Total Test Cases:** 60 tests
**Files Created:** 17 files
