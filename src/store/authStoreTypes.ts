import type { Nullable } from '../types/global';
import type { User } from '../types/models';
import type { AuthOAuthProvider } from '../features/auth/types';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  phone?: string;
}

export interface AuthState {
  user: Nullable<User>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Nullable<string>;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  login: (user: User) => void;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  loginWithOAuth: (provider: AuthOAuthProvider) => Promise<boolean>;
  completeOAuthCallback: (url: string) => Promise<boolean>;
  register: (data: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export type AuthStateSetter = (updater: (state: AuthState) => void) => void;
