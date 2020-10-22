import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});
