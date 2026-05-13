

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

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

export const API_HEADERS = {
  authorization: 'Authorization',
  contentType: 'Content-Type',
  accept: 'Accept',
  apiKey: 'X-API-Key',
  requestId: 'X-Request-ID',
  clientVersion: 'X-Client-Version',
  platform: 'X-Platform',
  deviceId: 'X-Device-ID',
  timestamp: 'X-Timestamp',
} as const;

export const CONTENT_TYPES = {
  json: 'application/json',
  formData: 'multipart/form-data',
  urlEncoded: 'application/x-www-form-urlencoded',
  text: 'text/plain',
  image: 'image/*',
} as const;

export const WS_EVENTS = {
  connection: {
    connect: 'connect',
    disconnect: 'disconnect',
    error: 'error',
    reconnect: 'reconnect',
  },
  user: {
    presence: 'user.presence',
    typing: 'user.typing',
    status: 'user.status',
  },
  notifications: {
    new: 'notification.new',
    read: 'notification.read',
  },
  squad: {
    memberJoined: 'squad.member_joined',
    memberLeft: 'squad.member_left',
    updated: 'squad.updated',
  },
  economy: {
    transaction: 'economy.transaction',
    balanceUpdate: 'economy.balance_update',
  },
} as const;

export const GRAPHQL_OPERATIONS = {
  queries: {
    getUser: 'GetUser',
    getSquad: 'GetSquad',
    getWallet: 'GetWallet',
    search: 'Search',
  },
  mutations: {
    updateUser: 'UpdateUser',
    createSquad: 'CreateSquad',
    updateSquad: 'UpdateSquad',
    joinSquad: 'JoinSquad',
    transfer: 'Transfer',
  },
  subscriptions: {
    onNotification: 'OnNotification',
    onMessage: 'OnMessage',
    onBalanceChange: 'OnBalanceChange',
  },
} as const;