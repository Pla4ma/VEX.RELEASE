/**
 * useAuth Hook Stub
 * Placeholder for authentication hook
 */

export function useAuth() {
  return {
    user: null,
    userId: null,
    isAuthenticated: false,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
  };
}

export default useAuth;
