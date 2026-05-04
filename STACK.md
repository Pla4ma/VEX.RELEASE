# VEX App Stack

## Implemented Stack

### Core Framework
- **Expo SDK 54** - Cross-platform development framework
- **TypeScript Strict** - Full type safety with strict compiler options
- **React Native 0.76.7** - Native rendering

### State Management & Data
- **TanStack Query** - Server state management with caching, refetching, offline support
  - Auto network-aware refetching
  - Query keys factory for type-safe queries
  - Default 5min stale time, 30min gc time
  
- **Zustand + Immer** - Client state with immutable updates
  - AsyncStorage persistence for auth state
  - SecureStorage for sensitive tokens

### Navigation
- **React Navigation 6** - Native-stack and bottom-tabs
  - Type-safe navigation params
  - Auth flow with conditional rendering
  - Deep linking support ready

### Animation
- **React Native Reanimated 3** - High-performance animations
  - Worklets for native-thread animations
  - Spring configs, transitions, timing utilities
  - Babel plugin configured for native only

### Storage & Persistence
- **MMKV** - Fast key-value storage for non-sensitive data
- **AsyncStorage** - Standard React Native storage
- **expo-secure-store** - Encrypted storage for tokens/credentials
  - Auth tokens stored securely
  - Automatic cleanup on logout

### Network & Connectivity
- **NetInfo** - Network state monitoring
  - Online/offline detection
  - Connection type (wifi/cellular)
  - TanStack Query integration for auto-pause when offline

### Provider Hierarchy
```
GestureHandlerRootView (native only)
└── SafeAreaProvider
    └── QueryProvider (TanStack Query)
        └── ThemeProvider
            └── ErrorBoundary
                └── RootNavigator
```

## File Structure

```
src/
├── api/
│   ├── QueryProvider.tsx      # TanStack Query setup
│   ├── client.ts              # API client
│   └── index.ts               # Exports
├── network/
│   ├── NetInfoAdapter.ts      # Network monitoring
│   ├── useNetInfo.ts          # React hook
│   └── index.ts
├── persistence/
│   ├── SecureStorage.ts       # Encrypted storage
│   ├── MMKVStorage.ts         # Fast storage
│   ├── AsyncStorageAdapter.ts # Standard storage
│   └── index.ts
├── store/
│   └── index.ts               # Zustand stores with persistence
└── app/
    ├── App.tsx                # Root with all providers
    └── providers/
        ├── AppProviders.tsx   # Centralized provider composition
        └── index.ts
```

## Usage Examples

### TanStack Query
```tsx
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '../api';

const { data } = useQuery({
  queryKey: QueryKeys.user(userId),
  queryFn: fetchUser,
});
```

### Secure Storage
```tsx
import { getSecureStorage, SecureStorageKeys } from '../persistence';

const secure = getSecureStorage();
await secure.setItem(SecureStorageKeys.AUTH_TOKEN, token);
```

### NetInfo Hook
```tsx
import { useNetInfo } from '../network';

const { isOnline, isWifi } = useNetInfo();
```

### Auth Store
```tsx
import { useAuthStore } from '../store';

const { login, logout, user } = useAuthStore();
```
