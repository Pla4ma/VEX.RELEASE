# State Flow Reference Document

## State Layer Definitions

### Layer 1: TanStack Query v5

**What it owns:**
- Server state that can be refetched
- Data backed by Supabase (users, sessions, squads, history)
- Cache invalidation on mutations
- Optimistic updates with rollback capability

**What it never owns:**
- Client-only UI state (modals, toasts, selected items)
- Form inputs (controlled by useState)
- Persistent app preferences (use Zustand + storage)
- Realtime subscription state (use Zustand)

**Configuration rules:**
```typescript
// Default query config for all server queries
export const defaultQueryConfig = {
  staleTime: 1000 * 60,      // 1 minute - data considered fresh
  gcTime: 1000 * 60 * 5,     // 5 minutes - keep in cache after unmount
  retry: 3,                   // 3 retries on failure
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  networkMode: 'online',      // Pause when offline
} as const;

// Write operations (mutations)
export const defaultMutationConfig = {
  retry: 2,                   // 2 retries for writes
  networkMode: 'always',      // Queue when offline
} as const;
```

**Decision tree:**
```
Is the data stored in Supabase?
  ├─ YES → Can it be updated by other users/devices?
  │    ├─ YES → Use TanStack Query (realtime sync needed)
  │    └─ NO → Could use TanStack Query OR Zustand + manual sync
  │         └─ Use TanStack Query for consistency
  └─ NO → Does it need to persist across app restarts?
       ├─ YES → Use Zustand + persist middleware
       └─ NO → Use useState
```

### Layer 2: Zustand

**What it owns:**
- Auth state (user, tokens, session)
- App preferences (theme, notification settings, coach personality)
- Offline queue entries
- UI state that persists (last viewed screen, draft forms)
- Current session runtime state (timer ticks, pause state)
- Realtime subscription connection status

**What it never owns:**
- Supabase query results (TanStack Query owns this)
- Server-side truth (always fetch from TanStack Query)
- Ephemeral UI state (useState is fine for that)

**Slice structure:**
```typescript
// Each domain gets its own slice
export interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface SettingsSlice {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  setTheme: (theme: SettingsSlice['theme']) => void;
}

export interface OfflineQueueSlice {
  queue: OfflineQueueEntry[];
  addEntry: (entry: Omit<OfflineQueueEntry, 'id'>) => void;
  removeEntry: (id: string) => void;
  processQueue: () => Promise<void>;
}

// Combined store
export const useAppStore = create<
  AuthSlice & SettingsSlice & OfflineQueueSlice
>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createSettingsSlice(...args),
      ...createOfflineQueueSlice(...args),
    }),
    {
      name: 'vex-app-storage',
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        theme: state.theme,
        notifications: state.notifications,
        queue: state.queue,
      }),
    }
  )
);
```

### Layer 3: useState

**What it owns:**
- Form input values
- Modal open/closed state
- Selected tab index
- Toggle states (show/hide)
- Animation values (unless using Reanimated)
- Draft text inputs

**What it never owns:**
- Data that needs to persist (use Zustand)
- Data from the server (use TanStack Query)
- Complex state that updates from multiple places (use Zustand)
- State that affects multiple components (lift to Zustand)

---

## Full Data Flow Trace

### Example: User Starts a Session

**Step 1: User Action (UI Layer)**
```typescript
// session-setup-screen.tsx
export function SessionSetupScreen() {
  const [selectedPreset, setSelectedPreset] = useState<SessionPreset>(PRESETS[1]);
  const { createSession, startSession } = useSession(userId); // Hook from hooks.ts
  
  const handleStart = async () => {
    // Calls hook method
    await createSession({
      duration: selectedPreset.duration,
      category: selectedPreset.category,
    });
    await startSession();
  };
  
  return <Button onPress={handleStart}>Start Session</Button>;
}
```

**Step 2: Hook Layer (hooks.ts)**
```typescript
// session/hooks/useSession.ts
export function useSession(userId: string) {
  const queryClient = useQueryClient();
  const { addEntry } = useOfflineQueueStore(); // Zustand for offline handling
  
  // Server state - TanStack Query
  const { data: session } = useQuery({
    queryKey: ['session', userId],
    queryFn: () => sessionService.getActiveSession(userId),
    staleTime: 1000 * 30,
  });
  
  // Mutation for creating session
  const createSessionMutation = useMutation({
    mutationFn: (config: SessionConfig) => 
      sessionService.createSession(userId, config),
    
    onMutate: async (config) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['session', userId] });
      const previousSession = queryClient.getQueryData(['session', userId]);
      
      const optimisticSession: Session = {
        id: 'temp-' + Date.now(),
        userId,
        status: 'CREATED',
        config,
        createdAt: Date.now(),
      };
      
      queryClient.setQueryData(['session', userId], optimisticSession);
      return { previousSession };
    },
    
    onError: (err, config, context) => {
      // Rollback on error
      if (context?.previousSession) {
        queryClient.setQueryData(['session', userId], context.previousSession);
      }
      // Queue for offline retry
      if (isOfflineError(err)) {
        addEntry({
          id: crypto.randomUUID(),
          type: 'CREATE_SESSION',
          payload: config,
          timestamp: Date.now(),
          retryCount: 0,
          status: 'PENDING',
        });
      }
    },
    
    onSettled: () => {
      // Always invalidate to ensure sync
      queryClient.invalidateQueries({ queryKey: ['session', userId] });
    },
  });
  
  return {
    session,
    createSession: createSessionMutation.mutateAsync,
    isPending: createSessionMutation.isPending,
  };
}
```

**Step 3: Service Layer (service.ts)**
```typescript
// session/service/session-lifecycle.ts
export async function createSession(
  userId: string, 
  config: SessionConfig
): Promise<Session> {
  // 1. Validate config
  const validatedConfig = SessionConfigSchema.parse(config);
  
  // 2. Check business rules
  const existingSession = await repository.fetchActiveSession(userId);
  if (existingSession) {
    throw new ConflictError('User already has an active session');
  }
  
  // 3. Calculate derived values
  const sessionId = crypto.randomUUID();
  const now = Date.now();
  
  // 4. Build domain object
  const session: Session = {
    id: sessionId,
    userId,
    status: 'CREATED',
    config: validatedConfig,
    phase: 'FOCUS',
    currentInterval: 1,
    elapsedSeconds: 0,
    remainingSeconds: validatedConfig.duration,
    score: 0,
    createdAt: now,
    updatedAt: now,
  };
  
  // 5. Persist via repository
  await repository.createSession(session);
  
  // 6. Emit event for other systems
  eventBus.publish('session:created', {
    sessionId,
    userId,
    config: validatedConfig,
    timestamp: now,
  });
  
  // 7. Track analytics
  analytics.trackSessionCreated(session);
  
  return session;
}

export async function startSession(sessionId: string): Promise<void> {
  const session = await repository.fetchSession(sessionId);
  
  if (!canStartSession(session)) {
    throw new ValidationError(`Cannot start session in ${session.status} state`);
  }
  
  const updatedSession = await repository.updateSessionStatus(
    sessionId, 
    'ACTIVE',
    { startedAt: Date.now() }
  );
  
  eventBus.publish('session:started', {
    sessionId,
    userId: session.userId,
    startedAt: Date.now(),
  });
  
  // Start timer in Zustand store (client state)
  useSessionStore.getState().startTimer(sessionId);
}
```

**Step 4: Repository Layer (repository.ts)**
```typescript
// session/repository/SessionRepository.ts
export async function createSession(session: Session): Promise<void> {
  // 1. Validate with Zod before sending to Supabase
  const validated = SessionSchema.parse(session);
  
  // 2. Supabase query
  const { error } = await supabase
    .from('sessions')
    .insert({
      id: validated.id,
      user_id: validated.userId,
      status: validated.status,
      config: validated.config,
      phase: validated.phase,
      current_interval: validated.currentInterval,
      elapsed_seconds: validated.elapsedSeconds,
      remaining_seconds: validated.remainingSeconds,
      score: validated.score,
      created_at: validated.createdAt,
      updated_at: validated.updatedAt,
    });
  
  // 3. Handle errors
  if (error) {
    throw new RepositoryError('createSession', error);
  }
}

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus,
  extraFields?: Record<string, unknown>
): Promise<Session> {
  const update = {
    status,
    updated_at: Date.now(),
    ...extraFields,
  };
  
  const { data, error } = await supabase
    .from('sessions')
    .update(update)
    .eq('id', sessionId)
    .select()
    .single();
  
  if (error) {
    throw new RepositoryError('updateSessionStatus', error);
  }
  
  // 4. Validate response with Zod
  return SessionSchema.parse(data);
}
```

**Step 5: Supabase**
- Query executes against `sessions` table
- RLS policy checks: user can only insert where `user_id = auth.uid()`
- Trigger `handle_new_session` fires (if defined in schema)
- Row inserted, confirmation returned

**Step 6: Response Flow**
```
Supabase → Repository (validates with Zod) → 
Service (emits event) → 
Hook (updates TanStack Query cache via onSuccess) → 
TanStack Query (invalidates ['session', userId]) → 
UI (re-renders with new data)
```

---

## Optimistic Update Flow

```typescript
// hooks.ts - Full optimistic update pattern
export function useCompleteSession() {
  const queryClient = useQueryClient();
  const { addEntry } = useOfflineQueueStore();
  
  return useMutation({
    mutationFn: sessionService.completeSession,
    
    // Step 1: Optimistic write
    onMutate: async (sessionId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['session', sessionId] 
      });
      await queryClient.cancelQueries({ 
        queryKey: ['session-history'] 
      });
      
      // Snapshot previous values
      const previousSession = queryClient.getQueryData<Session>(
        ['session', sessionId]
      );
      const previousHistory = queryClient.getQueryData<SessionHistoryEntry[]>(
        ['session-history']
      );
      
      // Optimistically update session
      if (previousSession) {
        queryClient.setQueryData(['session', sessionId], {
          ...previousSession,
          status: 'COMPLETED',
          completedAt: Date.now(),
        });
      }
      
      // Optimistically add to history
      if (previousHistory) {
        queryClient.setQueryData(['session-history'], [
          {
            sessionId,
            status: 'COMPLETED',
            completedAt: Date.now(),
            // ... other fields
          },
          ...previousHistory,
        ]);
      }
      
      // Return context for rollback
      return { previousSession, previousHistory, sessionId };
    },
    
    // Step 2: Error rollback
    onError: (error, sessionId, context) => {
      // Rollback session
      if (context?.previousSession) {
        queryClient.setQueryData(
          ['session', context.sessionId], 
          context.previousSession
        );
      }
      
      // Rollback history
      if (context?.previousHistory) {
        queryClient.setQueryData(
          ['session-history'], 
          context.previousHistory
        );
      }
      
      // Show error toast
      toast.error('Failed to complete session');
      
      // Queue for offline if network error
      if (isOfflineError(error)) {
        addEntry({
          id: crypto.randomUUID(),
          type: 'COMPLETE_SESSION',
          payload: { sessionId },
          timestamp: Date.now(),
          retryCount: 0,
          status: 'PENDING',
        });
      } else {
        // Log to Sentry for non-network errors
        Sentry.captureException(error, {
          tags: { feature: 'session-complete', sessionId },
        });
      }
    },
    
    // Step 3: Always invalidate
    onSettled: (data, error, sessionId) => {
      if (!isOfflineError(error)) {
        queryClient.invalidateQueries({ 
          queryKey: ['session', sessionId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['session-history'] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['user-stats'] 
        });
      }
    },
  });
}
```

---

## Offline Queue Flow

### Type Definition
```typescript
// shared/types/offline-queue.ts
export interface OfflineQueueEntry {
  id: string;                    // UUID for deduplication
  type: 'CREATE_SESSION' | 'COMPLETE_SESSION' | 'UPDATE_SESSION' | 
        'CLAIM_REWARD' | 'UPDATE_PROGRESS' | 'PURCHASE_ITEM';
  payload: Record<string, unknown>;
  timestamp: number;             // When queued
  retryCount: number;            // Failed retry attempts
  status: 'PENDING' | 'PROCESSING' | 'FAILED' | 'DEAD';
  lastError?: string;            // Error message from last attempt
  priority: 1 | 2 | 3;          // 1 = high (rewards), 2 = normal, 3 = low (analytics)
}
```

### Interception Flow
```typescript
// shared/hooks/useNetInfo.ts
export function useNetInfo() {
  const [isConnected, setIsConnected] = useState(true);
  const { queue, processQueue } = useOfflineQueueStore();
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isConnected;
      const nowOnline = state.isConnected;
      
      setIsConnected(!!nowOnline);
      
      // Process queue when coming back online
      if (wasOffline && nowOnline && queue.length > 0) {
        processQueue();
      }
    });
    
    return unsubscribe;
  }, [isConnected, queue, processQueue]);
  
  return { isConnected };
}
```

### Queue Processing
```typescript
// features/offline-queue/service.ts
export async function processQueue(): Promise<void> {
  const { queue, updateEntry, removeEntry } = useOfflineQueueStore.getState();
  
  // Sort by priority and timestamp
  const sortedQueue = [...queue].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.timestamp - b.timestamp;
  });
  
  for (const entry of sortedQueue) {
    if (entry.status !== 'PENDING') continue;
    
    // Mark as processing
    updateEntry(entry.id, { status: 'PROCESSING' });
    
    try {
      // Execute based on type
      switch (entry.type) {
        case 'CREATE_SESSION':
          await sessionService.createSession(
            entry.payload.userId,
            entry.payload.config
          );
          break;
        case 'COMPLETE_SESSION':
          await sessionService.completeSession(entry.payload.sessionId);
          break;
        case 'PURCHASE_SHOP_ITEM':
          await shopService.purchaseItem(
            entry.payload.userId,
            entry.payload.shopItemId
          );
          break;
        case 'START_CRAFTING_JOB':
          await craftingService.startCraftingJob(
            entry.payload.userId,
            entry.payload.recipeId,
            entry.payload.stationId
          );
          break;
        case 'USE_INVENTORY_ITEM':
          await inventoryService.useItem(
            entry.payload.userId,
            entry.payload.inventoryItemId
          );
          break;
        // ... other types
      }
      
      // Success - remove from queue
      removeEntry(entry.id);
      
    } catch (error) {
      const newRetryCount = entry.retryCount + 1;
      
      if (newRetryCount >= 3) {
        // Max retries - mark as dead
        updateEntry(entry.id, {
          status: 'DEAD',
          retryCount: newRetryCount,
          lastError: error instanceof Error ? error.message : 'Unknown error',
        });
        
        // Notify user of permanent failure
        toast.error(`Failed to sync: ${entry.type}`);
        
        // Log to Sentry
        Sentry.captureException(error, {
          tags: { 
            feature: 'offline-queue',
            entryType: entry.type,
            dead: 'true',
          },
          extra: { entry },
        });
      } else {
        // Retry later
        updateEntry(entry.id, {
          status: 'PENDING',
          retryCount: newRetryCount,
          lastError: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
}
```

### Deduplication
```typescript
// When adding to queue, check for duplicates
export function addEntry(
  entry: Omit<OfflineQueueEntry, 'id' | 'timestamp' | 'retryCount' | 'status'>
): void {
  const { queue, updateEntry } = useOfflineQueueStore.getState();
  
  // Check for existing pending entry of same type with same payload
  const duplicate = queue.find(e => 
    e.type === entry.type &&
    e.status === 'PENDING' &&
    deepEqual(e.payload, entry.payload)
  );
  
  if (duplicate) {
    // Update timestamp to keep it fresh
    updateEntry(duplicate.id, { 
      timestamp: Date.now(),
      priority: Math.min(duplicate.priority, entry.priority) // Keep higher priority
    });
    return;
  }
  
  // Add new entry
  const newEntry: OfflineQueueEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retryCount: 0,
    status: 'PENDING',
  };
  
  useOfflineQueueStore.setState(state => ({
    queue: [...state.queue, newEntry],
  }));
}
```

### Conflict Resolution
```typescript
// For entries that might conflict with newer server state
export async function resolveConflict(
  entry: OfflineQueueEntry
): Promise<'proceed' | 'skip' | 'merge'> {
  switch (entry.type) {
    case 'UPDATE_SESSION': {
      const serverSession = await sessionRepository.fetchSession(
        entry.payload.sessionId
      );
      
      // If server has newer data, merge carefully
      if (serverSession.updatedAt > entry.timestamp) {
        // Server state wins for critical fields
        if (serverSession.status === 'COMPLETED') {
          return 'skip'; // Can't update completed session
        }
        return 'merge';
      }
      
      return 'proceed';
    }
    
    case 'CLAIM_REWARD': {
      // Check if reward already claimed
      const alreadyClaimed = await rewardRepository.checkClaimed(
        entry.payload.userId,
        entry.payload.rewardId
      );
      
      if (alreadyClaimed) {
        return 'skip'; // Duplicate prevention
      }
      
      return 'proceed';
    }
    
    case 'START_CRAFTING_JOB': {
      // Check if ingredients still available
      const canCraft = await craftingService.validateIngredients(
        entry.payload.userId,
        entry.payload.recipeId
      );
      
      if (!canCraft) {
        return 'skip'; // Ingredients consumed by another action
      }
      
      return 'proceed';
    }
    
    default:
      return 'proceed';
  }
}
```

---

## Error + Retry Flow

### Read Error Flow
```typescript
// hooks/useSession.ts
export function useSession(userId: string) {
  return useQuery({
    queryKey: ['session', userId],
    queryFn: () => sessionService.getActiveSession(userId),
    
    // TanStack Query retry config
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client error)
      if (error instanceof ValidationError) return false;
      if (error instanceof AuthError) return false;
      
      // Retry network errors up to 3 times
      if (isNetworkError(error) && failureCount < 3) return true;
      
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Error state handling
    meta: {
      errorMessage: 'Failed to load session',
    },
  });
}

// UI usage with error state
export function ActiveSessionScreen() {
  const { session, isLoading, isError, error, refetch } = useSession(userId);
  
  if (isLoading) return <SessionSkeleton />;
  
  if (isError) {
    return (
      <ErrorState
        title="Failed to load session"
        message={error?.message || 'Please try again'}
        onRetry={refetch}
        retryCount={3}
      />
    );
  }
  
  return <SessionView session={session} />;
}
```

### Write Error Flow
```typescript
// hooks/useCompleteSession.ts
export function useCompleteSession() {
  return useMutation({
    mutationFn: sessionService.completeSession,
    
    onError: (error, variables) => {
      // Classify error type
      if (isNetworkError(error)) {
        // Will be handled by offline queue
        toast.info('Session will sync when online');
        return;
      }
      
      if (isValidationError(error)) {
        // User-facing validation error
        toast.error(error.message);
        return;
      }
      
      if (isServerError(error)) {
        // Server error - log to Sentry
        Sentry.captureException(error, {
          tags: { 
            feature: 'session-complete',
            errorType: 'server',
          },
          extra: { 
            sessionId: variables,
            endpoint: 'POST /sessions/:id/complete',
          },
        });
        
        toast.error('Something went wrong. Our team has been notified.');
        return;
      }
      
      // Unknown error - always log
      Sentry.captureException(error, {
        tags: { feature: 'session-complete', errorType: 'unknown' },
      });
      
      toast.error('An unexpected error occurred');
    },
  });
}
```

### Error Boundary Pattern
```typescript
// shared/components/error-boundary.tsx
export class SessionErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope(scope => {
      scope.setTag('error-boundary', 'session');
      scope.setExtra('componentStack', errorInfo.componentStack);
      Sentry.captureException(error);
    });
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback 
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    
    return this.props.children;
  }
}

// Usage
export function SessionScreen() {
  return (
    <SessionErrorBoundary>
      <ActiveSessionScreen />
    </SessionErrorBoundary>
  );
}
```

---

## Realtime Subscription Flow

### Subscription Hook
```typescript
// features/session/hooks/useRealtimeSession.ts
export function useRealtimeSession(sessionId: string) {
  const queryClient = useQueryClient();
  const { isConnected } = useNetInfo();
  
  useEffect(() => {
    if (!isConnected || !sessionId) return;
    
    // Subscribe to Supabase realtime
    const subscription = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          // Validate incoming data
          const validated = SessionSchema.safeParse(payload.new);
          
          if (!validated.success) {
            Sentry.captureMessage('Invalid realtime data received', {
              level: 'warning',
              extra: { payload, errors: validated.error.errors },
            });
            return;
          }
          
          // Update TanStack Query cache
          queryClient.setQueryData(
            ['session', sessionId],
            validated.data
          );
          
          // Emit local event for other systems
          eventBus.publish('session:realtime-update', {
            sessionId,
            changeType: payload.eventType,
            data: validated.data,
          });
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId, isConnected, queryClient]);
}
```

### Conflict Resolution with Optimistic Updates
```typescript
// When realtime update conflicts with optimistic state
export function useSessionWithRealtime(userId: string) {
  const queryClient = useQueryClient();
  const [pendingOptimisticId, setPendingOptimisticId] = useState<string | null>(null);
  
  // Regular query
  const query = useQuery({
    queryKey: ['session', userId],
    queryFn: () => sessionService.getActiveSession(userId),
  });
  
  // Realtime subscription
  useEffect(() => {
    if (!query.data?.id) return;
    
    const subscription = supabase
      .channel(`session:${query.data.id}`)
      .on('postgres_changes', { /* ... */ }, (payload) => {
        const serverData = SessionSchema.parse(payload.new);
        
        // Check if we have pending optimistic update
        if (pendingOptimisticId) {
          const optimisticData = queryClient.getQueryData<Session>(
            ['session', userId]
          );
          
          // If server is ahead of our optimistic data, accept server
          if (serverData.updatedAt > (optimisticData?.updatedAt || 0)) {
            queryClient.setQueryData(['session', userId], serverData);
            setPendingOptimisticId(null);
          }
          // Otherwise, keep optimistic (it will sync when mutation completes)
        } else {
          // No pending optimistic, just accept server data
          queryClient.setQueryData(['session', userId], serverData);
        }
      })
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, [query.data?.id, userId, pendingOptimisticId, queryClient]);
  
  // Mutation with optimistic tracking
  const mutation = useMutation({
    mutationFn: sessionService.updateSession,
    onMutate: async (variables) => {
      setPendingOptimisticId(crypto.randomUUID());
      // ... optimistic update
    },
    onSettled: () => {
      setPendingOptimisticId(null);
      queryClient.invalidateQueries({ queryKey: ['session', userId] });
    },
  });
  
  return { ...query, updateSession: mutation.mutate };
}

---

## Phase 3 — Enhanced Repository & Service Patterns (COMPLETED)

### Enhanced Repository Pattern

**Repository with Retry Logic:**
```typescript
// repository-enhanced.ts pattern
export async function fetchProgressionWithRetry(
  userId: string,
  maxRetries: number = 3
): Promise<Progression> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await baseFetchProgression(userId);
      return result;
    } catch (error) {
      lastError = error as Error;
      if (!isRetryableError(error)) throw error;
      await delay(Math.min(1000 * Math.pow(2, attempt), 5000));
    }
  }
  
  throw new RepositoryError(
    'fetchProgressionWithRetry',
    lastError,
    true
  );
}
```

**Optimistic Locking:**
```typescript
export async function updateProgressionOptimistic(
  userId: string,
  update: ProgressionUpdate,
  expectedVersion: number
): Promise<Progression> {
  const { data, error } = await supabase
    .from('progression')
    .update({ ...update, version: expectedVersion + 1 })
    .eq('userId', userId)
    .eq('version', expectedVersion)  // Optimistic lock
    .single();
    
  if (error?.code === 'P0002') {
    throw new OptimisticLockError('Version mismatch, retry required');
  }
  
  return data;
}
```

**Batch Operations:**
```typescript
export async function batchXpEntries(
  entries: XpEntryInput[]
): Promise<XpEntry[]> {
  const { data, error } = await supabase
    .from('xp_entries')
    .insert(entries)
    .select();
    
  if (error) throw new RepositoryError('batchXpEntries', error);
  return data.map(entry => XpEntrySchema.parse(entry));
}
```

### Enhanced Service Pattern

**Idempotency Handling:**
```typescript
export async function addXpEnhanced(
  userId: string,
  entry: XpEntryInput,
  options: { skipEvents?: boolean } = {}
): Promise<AddXpResult> {
  // Check for existing entry with same idempotency key
  const existing = await repository.getXpEntryByIdempotencyKey(
    entry.idempotencyKey
  );
  
  if (existing) {
    return { xpAdded: 0, alreadyProcessed: true };
  }
  
  // Process with race condition protection
  const result = await withLock(`progression:${userId}`, async () => {
    const progression = await repository.fetchProgression(userId);
    const newXp = progression.xp + entry.amount;
    
    // Check for level up
    let levelUpOccurred = false;
    let newLevel = progression.level;
    let newNextThreshold = progression.nextLevelThreshold;
    
    while (newXp >= newNextThreshold && newLevel < MAX_LEVEL) {
      newXp -= newNextThreshold;
      newLevel++;
      newNextThreshold = calculateThreshold(newLevel);
      levelUpOccurred = true;
    }
    
    // Atomic update
    await repository.updateProgression(userId, {
      xp: newXp,
      level: newLevel,
      nextLevelThreshold: newNextThreshold,
      totalXp: progression.totalXp + entry.amount,
      lastLevelUpAt: levelUpOccurred ? Date.now() : null,
    });
    
    // Record entry
    await repository.recordXpEntry({
      ...entry,
      previousLevel: progression.level,
      newLevel,
    });
    
    return {
      xpAdded: entry.amount,
      levelUpOccurred,
      newLevel,
      newXp,
      nextThreshold: newNextThreshold,
    };
  });
  
  // Emit events after successful update
  if (!options.skipEvents) {
    eventBus.publish('progression:xp_added', {
      userId,
      amount: entry.amount,
      source: entry.source,
    });
    
    if (result.levelUpOccurred) {
      eventBus.publish('progression:level_up', {
        userId,
        previousLevel: result.previousLevel,
        newLevel: result.newLevel,
      });
    }
  }
  
  return result;
}
```

**Offline Queue Fallback:**
```typescript
export async function addXpWithFallback(
  userId: string,
  entry: XpEntryInput
): Promise<AddXpResult | { queued: true }> {
  try {
    // Try to add XP online
    return await addXpEnhanced(userId, entry);
  } catch (error) {
    if (isNetworkError(error)) {
      // Queue for later if offline
      offlineQueue.enqueue({
        operation: 'XP_ADD',
        feature: 'progression',
        payload: { userId, entry },
        idempotencyKey: entry.idempotencyKey,
        priority: 'high',
        maxRetries: 5,
      });
      
      return { queued: true };
    }
    throw error;
  }
}
```

### Concurrency Control Patterns

**Distributed Lock:**
```typescript
async function withLock<T>(
  lockKey: string,
  fn: () => Promise<T>,
  timeout: number = 5000
): Promise<T> {
  const lockId = crypto.randomUUID();
  const acquired = await redis.set(
    `lock:${lockKey}`,
    lockId,
    'PX',
    timeout,
    'NX'
  );
  
  if (!acquired) {
    throw new ConcurrencyError('Could not acquire lock');
  }
  
  try {
    return await fn();
  } finally {
    await redis.del(`lock:${lockKey}`);
  }
}
```

### Event-Driven Integration Pattern

**Integration Wiring:**
```typescript
// sessions-feed.ts
export function initializeSessionsFeedIntegration(): () => void {
  const unsubscribe = eventBus.subscribe('sessions:completed', async (event) => {
    const { userId, sessionId, duration, qualityScore, streakDays } = event;
    
    // 1. Update Streaks
    const streakResult = await recordSession({ userId, sessionId, duration, qualityScore });
    
    // 2. Award XP
    const xpResult = await addXpEnhanced(userId, { /* ... */ });
    
    // 3. Create Rewards
    const rewards = await createSessionRewards(userId, { streakResult, xpResult });
    
    // 4. Apply Boss Damage
    await applyBossDamageFromSession(userId, sessionId, qualityScore);
    
    // 5. Social Activity
    if (streakResult.milestoneReached || xpResult.levelUpOccurred) {
      eventBus.publish('social:activity', { /* ... */ });
    }
    
    // 6. Analytics
    Sentry.addBreadcrumb({ /* ... */ });
  });
  
  return unsubscribe;
}
```

### Test State Management

**Comprehensive Test Patterns:**
```typescript
// service-comprehensive.test.ts pattern

describe('Service Integration', () => {
  // Mock repository and eventBus
  const mockRepository = {
    fetchProgression: vi.fn(),
    updateProgression: vi.fn(),
    recordXpEntry: vi.fn(),
  };
  
  const mockEventBus = {
    publish: vi.fn(),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should handle idempotency correctly', async () => {
    // Same idempotency key should return cached result
  });
  
  it('should handle race conditions with locking', async () => {
    // Concurrent updates should be sequential
  });
  
  it('should emit correct events on success', async () => {
    // Verify all events published
  });
  
  it('should rollback on failure', async () => {
    // Failed operations should not persist partial state
  });
  
  it('should handle offline queue fallback', async () => {
    // Network errors should queue for retry
  });
});
```

### State Flow Summary (Phase 3)

**Progression Flow:**
```
Session Complete
  ↓
Calculate XP (with all multipliers)
  ↓
Acquire Lock (prevent race conditions)
  ↓
Update Progression (atomic)
  ↓
Record XP Entry (audit trail)
  ↓
Release Lock
  ↓
Emit Events (progression:xp_added)
  ↓
Check Level Up → Emit (progression:level_up)
  ↓
Create Rewards → Emit (rewards:created)
```

**Boss Battle Flow:**
```
Session Complete
  ↓
Calculate Damage (session quality + bonuses)
  ↓
Update Boss Health (subtractive)
  ↓
Record Session Contribution
  ↓
Check Boss Defeated?
  ├─ YES → Distribute Rewards
  │         Emit (boss:defeated)
  │         Emit (rewards:created)
  │
  └─ NO → Check Timeout?
            ├─ YES → Consolation Rewards
            └─ NO → Continue Battle
```

**Streak Flow:**
```
Session Complete (qualifying)
  ↓
Check Last Session Time
  ↓
Calculate Risk Level
  ├─ NONE → Increment Streak
  ├─ LOW/MEDIUM → Allow manual increment
  └─ HIGH/CRITICAL → Check Shield?
                        ├─ YES → Use Shield, Extend 24h
                        └─ NO → Break Streak
```
```
