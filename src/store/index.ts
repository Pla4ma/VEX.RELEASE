import { useAuthStore } from './authStore';
import { useAppStore } from './appStore';
import { useUIStore } from './uiStore';

export { useAuthStore, useAppStore, useUIStore };

export function useStore() {
  return {
    auth: useAuthStore(),
    app: useAppStore(),
    ui: useUIStore(),
  };
}
