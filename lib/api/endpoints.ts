// NEXT_PUBLIC_ prefix is mandatory here: this constant feeds the shared
// axios client, which runs in the BROWSER. Non-prefixed vars are not
// inlined by Next.js.
//
// Empty by default => SAME-ORIGIN mode: every call goes to whatever host
// serves this app (the only thing reachable when the API is not
// published), and next.config.ts rewrites proxy /api/* into commons-net.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const API_ENDPOINTS = {
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
  },
  users: {
    list: '/api/v1/users',
    me: '/api/v1/users/me',
    update: (id: string) => `/api/v1/users/${id}`,
    get: (id: string) => `/api/v1/users/${id}`,
  },
  categories: {
    list: '/api/v1/categories',
    get: (id: string) => `/api/v1/categories/${id}`,
    create: '/api/v1/categories',
    update: (id: string) => `/api/v1/categories/${id}`,
    delete: (id: string) => `/api/v1/categories/${id}`,
  },
  stores: {
    list: '/api/v1/stores',
    get: (id: string) => `/api/v1/stores/${id}`,
    me: '/api/v1/stores/me',
    create: '/api/v1/stores',
    update: (id: string) => `/api/v1/stores/${id}`,
    delete: (id: string) => `/api/v1/stores/${id}`,
    pending: '/api/v1/stores/admin/pending',
    updateStatus: (id: string) => `/api/v1/stores/admin/${id}/status`,
  },
  products: {
    list: '/api/v1/products',
    get: (id: string) => `/api/v1/products/${id}`,
    byStore: (storeId: string) => `/api/v1/products/store/${storeId}`,
    create: '/api/v1/products',
    update: (id: string) => `/api/v1/products/${id}`,
    delete: (id: string) => `/api/v1/products/${id}`,
  },
  reviews: {
    list: '/api/v1/reviews',
    get: (id: string) => `/api/v1/reviews/${id}`,
    create: '/api/v1/reviews',
    update: (id: string) => `/api/v1/reviews/${id}`,
    delete: (id: string) => `/api/v1/reviews/${id}`,
  },
  chat: {
    token: '/api/v1/chat/token',
    conversations: '/api/v1/chat/conversations',
    messages: (conversationId: string) => `/api/v1/chat/conversations/${conversationId}/messages`,
    sendMessage: '/api/v1/chat/messages',
    getOrCreateConversation: (participantId: string) => `/api/v1/chat/conversations/user/${participantId}`,
  },
  wishlist: {
    list: '/api/v1/wishlist',
    add: '/api/v1/wishlist',
    remove: (productId: string) => `/api/v1/wishlist/${productId}`,
    check: (productId: string) => `/api/v1/wishlist/check/${productId}`,
    clear: '/api/v1/wishlist',
  },
  sellerRequests: {
    list: '/api/v1/seller-requests',
    create: '/api/v1/seller-requests',
    updateStatus: (id: string) => `/api/v1/seller-requests/${id}/status`,
  },
  admin: {
    stats: '/api/v1/admin/stats',
    products: {
      delete: (id: string) => `/api/v1/admin/products/${id}`,
    },
  },
} as const;

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];