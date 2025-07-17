import { SetMetadata } from '@nestjs/common';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const RATE_LIMIT_KEY = 'rateLimit';
export const RateLimit = (config: RateLimitConfig) =>
  SetMetadata(RATE_LIMIT_KEY, config);

// Preset configurations
export const RateLimitStrict = () =>
  RateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 }); // 5 requests per 15 minutes

export const RateLimitModerate = () =>
  RateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 100 }); // 100 requests per 15 minutes

export const RateLimitLoose = () =>
  RateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 1000 }); // 1000 requests per 15 minutes

export const RateLimitAuth = () =>
  RateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    skipSuccessfulRequests: true,
  }); // 5 failed attempts per 15 minutes

export const RateLimitAPI = () =>
  RateLimit({ windowMs: 60 * 1000, maxRequests: 60 }); // 60 requests per minute
