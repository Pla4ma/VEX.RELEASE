export { useAuthStore } from "./authStore";
export { useAppStore } from "./appStore";
export { useUIStore } from "./uiStore";

export function useStore() {
  return {
    auth: useAuthStore(),
    app: useAppStore(),
    ui: useUIStore(),
  };
}
