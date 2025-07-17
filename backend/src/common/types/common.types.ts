// Common types used throughout the application

export interface RequestUser {
  id: string;
  email: string;
  role: string;
  storeId?: string;
  tenantId?: string;
}

export interface RequestWithUser {
  user: RequestUser;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface DatabaseManager {
  query: (sql: string, parameters?: unknown[]) => Promise<unknown[]>;
  transaction: <T>(
    callback: (manager: DatabaseManager) => Promise<T>,
  ) => Promise<T>;
}

export interface RedisStats {
  connected: boolean;
  stats?: {
    redis_version?: string;
    total_connections_received: number;
    total_commands_processed: number;
    keyspace_hits: number;
    keyspace_misses: number;
    used_memory: string;
    used_memory_peak: string;
    connected_clients: number;
    blocked_clients: number;
  };
  error?: string;
}

export interface QuotationItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface QuotationData {
  id: string;
  customerName: string;
  customerEmail: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
}

export interface PrintData {
  type: 'quotation' | 'invoice' | 'receipt';
  data: QuotationData | Record<string, unknown>;
}

export interface BarcodeData {
  text: string;
  format: 'CODE128' | 'CODE39' | 'EAN13' | 'QR';
  width?: number;
  height?: number;
}

export interface FilterCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'notIn';
  value: string | number | boolean | string[] | number[];
}

export interface FilterOptions {
  conditions?: FilterCondition[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface AuditMetadata {
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
  signature?: string;
}

export interface OrderItemData {
  productId: string;
  quantity: number;
  price: number;
  discount?: number;
  notes?: string;
}

export interface OrderUpdateData {
  customerId?: string;
  status?: string;
  paymentStatus?: string;
  notes?: string;
  orderItems?: OrderItemData[];
}

export interface PaymentData {
  orderId: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  notes?: string;
}

export interface CustomerFilter {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface ReportData {
  type: string;
  filters: Record<string, unknown>;
  data: Record<string, unknown>[];
  summary: Record<string, unknown>;
}

export interface CacheDecoratorOptions {
  ttl?: number;
  key?: string;
  prefix?: string;
}

export interface CacheTarget {
  [key: string]: unknown;
}

export interface PropertyDescriptor {
  value: (...args: unknown[]) => Promise<unknown>;
  writable?: boolean;
  enumerable?: boolean;
  configurable?: boolean;
}

export interface ExceptionInfo {
  message: string;
  stack?: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface HealthCheckResult {
  connected: boolean;
  stats?: Record<string, unknown>;
  error?: string;
}

export interface ConcurrentPromiseResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  duration?: number;
}

export interface MockData {
  orders: OrderUpdateData[];
  payments: PaymentData[];
  auditLogs: AuditMetadata[];
}

export interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  throughput: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LogContext {
  userId?: string;
  storeId?: string;
  tenantId?: string;
  requestId?: string;
  action?: string;
  resource?: string;
  [key: string]: unknown;
}

export interface SecurityContext {
  user: RequestUser;
  permissions: string[];
  roles: string[];
  storeId?: string;
  tenantId?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface DatabaseConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
  poolSize?: number;
}

export interface RedisConnectionConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  database: DatabaseConnectionConfig;
  redis: RedisConnectionConfig;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: RateLimitConfig;
}
