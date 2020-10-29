/**
 * Miltiple rate limiters for different routes. Only applied in NODE_ENV=production
 *
 */
import rateLimit from "express-rate-limit";

/**
 * Very low limit for the login
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});
/**
 * Very low limit for the login
 */
export const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});
/**
 * general limit for all routes
 *
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
});
