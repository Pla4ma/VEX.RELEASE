/**
 * API endpoint paths
 * Organized by domain/feature
 */
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
  },

  // User
  user: {
    me: '/users/me',
    profile: '/users/:id',
    updateProfile: '/users/me',
    changePassword: '/users/me/password',
    deleteAccount: '/users/me',
    preferences: '/users/me/preferences',
    settings: '/users/me/settings',
  },

  // Squads
  squads: {
    list: '/squads',
    detail: '/squads/:id',
    create: '/squads',
    update: '/squads/:id',
    delete: '/squads/:id',
    join: '/squads/:id/join',
    leave: '/squads/:id/leave',
    members: '/squads/:id/members',
    invite: '/squads/:id/invite',
  },

  // Economy
  wallet: {
    balance: '/wallet/balance',
    transactions: '/wallet/transactions',
    deposit: '/wallet/deposit',
    withdraw: '/wallet/withdraw',
    transfer: '/wallet/transfer',
  },

  // Achievements
  achievements: {
    list: '/achievements',
    detail: '/achievements/:id',
    progress: '/achievements/progress',
    claim: '/achievements/:id/claim',
  },

  // Notifications
  notifications: {
    list: '/notifications',
    markRead: '/notifications/:id/read',
    markAllRead: '/notifications/read-all',
    delete: '/notifications/:id',
    preferences: '/notifications/preferences',
  },

  // Search
  search: {
    global: '/search',
    users: '/search/users',
    squads: '/search/squads',
    suggestions: '/search/suggestions',
  },

  // Uploads
  upload: {
    image: '/upload/image',
    avatar: '/upload/avatar',
    banner: '/upload/banner',
  },
} as const;
