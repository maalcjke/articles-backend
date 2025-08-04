export interface RedisModuleOptions {
  url: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
  keyPrefix?: string;
  family?: number;
  keepAlive?: number;
  connectTimeout?: number;
  commandTimeout?: number;
}
