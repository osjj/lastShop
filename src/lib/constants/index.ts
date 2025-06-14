// Application constants

export const APP_CONFIG = {
  name: 'ShopNext',
  description: '现代化电商平台',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '1.0.0',
} as const;

export const API_ROUTES = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    resetPassword: '/api/auth/reset-password',
  },
  users: {
    profile: '/api/users/profile',
    addresses: '/api/users/addresses',
  },
  products: {
    list: '/api/products',
    detail: (id: string) => `/api/products/${id}`,
    reviews: (id: string) => `/api/products/${id}/reviews`,
  },
  categories: {
    list: '/api/categories',
  },
  cart: {
    get: '/api/cart',
    items: '/api/cart/items',
    item: (id: string) => `/api/cart/items/${id}`,
  },
  orders: {
    list: '/api/orders',
    create: '/api/orders',
    detail: (id: string) => `/api/orders/${id}`,
    cancel: (id: string) => `/api/orders/${id}/cancel`,
    updateStatus: (id: string) => `/api/orders/${id}/status`,
  },
  payments: {
    createIntent: '/api/payments/create-intent',
    confirm: '/api/payments/confirm',
  },
  upload: {
    images: '/api/upload/images',
  },
} as const;

export const PAGE_ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  products: '/products',
  product: (slug: string) => `/products/${slug}`,
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  order: (id: string) => `/orders/${id}`,
  profile: '/profile',
  admin: '/admin',
} as const;

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1,
} as const;

export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
} as const;

export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

export const VALIDATION_RULES = {
  email: {
    minLength: 5,
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
  },
  name: {
    minLength: 1,
    maxLength: 50,
  },
  productName: {
    minLength: 1,
    maxLength: 200,
  },
  description: {
    maxLength: 2000,
  },
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_NOT_CANCELLABLE: 'ORDER_NOT_CANCELLABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  REGISTER_SUCCESS: '注册成功',
  LOGOUT_SUCCESS: '退出成功',
  PROFILE_UPDATED: '个人信息更新成功',
  ADDRESS_ADDED: '地址添加成功',
  ADDRESS_UPDATED: '地址更新成功',
  ADDRESS_DELETED: '地址删除成功',
  CART_ITEM_ADDED: '商品已添加到购物车',
  CART_ITEM_UPDATED: '购物车已更新',
  CART_ITEM_REMOVED: '商品已从购物车移除',
  ORDER_CREATED: '订单创建成功',
  ORDER_CANCELLED: '订单取消成功',
  PAYMENT_SUCCESS: '支付成功',
  REVIEW_SUBMITTED: '评价提交成功',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  VALIDATION_FAILED: '数据验证失败',
  UNAUTHORIZED: '请先登录',
  FORBIDDEN: '权限不足',
  NOT_FOUND: '资源不存在',
  DUPLICATE_EMAIL: '邮箱已被注册',
  INVALID_CREDENTIALS: '邮箱或密码错误',
  INSUFFICIENT_STOCK: '库存不足',
  PAYMENT_FAILED: '支付失败',
  ORDER_NOT_CANCELLABLE: '订单无法取消',
  FILE_TOO_LARGE: '文件大小超出限制',
  INVALID_FILE_TYPE: '不支持的文件类型',
} as const;
