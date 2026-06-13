import type { NavigationProp } from '@react-navigation/native';
import type { ExtendedRootStackParams } from './param-types';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('navigation:safety');

export function isNavigationReady(
  navigation:
    | NavigationProp<ExtendedRootStackParams>
    | null
    | undefined,
): navigation is NavigationProp<ExtendedRootStackParams> {
  return (
    navigation !== null &&
    navigation !== undefined &&
    typeof navigation.navigate === 'function'
  );
}

export function safeNavigate<T extends keyof ExtendedRootStackParams>(
  navigation:
    | NavigationProp<ExtendedRootStackParams>
    | null
    | undefined,
  screen: T,
  params?: ExtendedRootStackParams[T],
): boolean {
  if (!isNavigationReady(navigation)) {
    debug.warn('Navigation not ready, cannot navigate to %s', screen);
    return false;
  }
  try {
    navigation.navigate(
      screen as string,
      params,
    );
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debug.error('Navigation failed: %s', new Error(errorMessage));
    return false;
  }
}

export function isCurrentRoute(
  routeName: string | undefined,
  expectedRoute: string,
): boolean {
  return routeName === expectedRoute;
}

export function getCurrentRouteName(
  navigationState:
    | { routes: Array<{ name: string }>; index: number }
    | undefined,
): string | undefined {
  if (!navigationState) {
    return undefined;
  }
  const currentRoute = navigationState.routes[navigationState.index];
  return currentRoute?.name;
}

export function canGoBack(
  navigation: NavigationProp<ExtendedRootStackParams>,
): boolean {
  return navigation.canGoBack();
}

export function safeGoBack(
  navigation:
    | NavigationProp<ExtendedRootStackParams>
    | null
    | undefined,
): boolean {
  if (!isNavigationReady(navigation)) {
    return false;
  }
  if (!navigation.canGoBack()) {
    debug.warn('Cannot go back - no routes in history');
    return false;
  }
  navigation.goBack();
  return true;
}
