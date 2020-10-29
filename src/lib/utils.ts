import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { AsyncMiddlewareFunction, MiddlewareFunction } from "../common/types";
import { logger } from "./logger";

/**
 * This function can be used to wrap request handlers into an async function
 * so we can make async/await calls to prisma.
 * It is taken from https://zellwk.com/blog/async-await-express/
 * FIXME: [DATAHUB-80] Once async handlers land in express we should fix this.
 * There are also some packages that seem more robust then my snippet here.
 * - https://www.npmjs.com/package/express-async-handler
 */
export function asyncWrapper(
  callback: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return function (req, res, next): void {
    callback(req, res, next).catch(next);
  };
}

/**
 * This function wraps middlewares to enable async calls in there.
 * It is taken from https://github.com/tranvansang/middleware-async
 *
 * FIXME: [DATAHUB-79] Once async middlewares land in express we van remove this.
 * If we run into errors it might be necessary to use the original repo and to contribute.
 * FIXME: [DATAHUB-81] Create robust Typescript function signature
 *
 */
export const asyncMiddlewareWrapper = (middleware: AsyncMiddlewareFunction) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  (async () => {
    let called = false;
    const cb = <T>(...args: ReadonlyArray<T>) => {
      if (called) return;
      called = true;
      next(...args);
    };
    try {
      await middleware(req, res, cb);
    } catch (err) {
      cb(err);
    }
  })();
};

/**
 * General error handler for all thrown errors in the application
 */
export const errorHandler: (
  error: Error | createError.HttpError,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => void = (error, _request, response, _next) => {
  let status = 500;
  if (error instanceof createError.HttpError) {
    status = error.status;
  }
  if (process.env.NODE_ENV === "development") {
    logger.log("error", error);
  } else {
    logger.error("error", error.message);
  }
  // Sends response

  response.status(status).json({
    status,
    message: error.message,
  });
};

/**
 * Creates a response payload with named objects
 * @example
 * createPayload({application});
 * @example
 * createPayload({applications:[]})
 *
 */
export function createPayload<T>(obj: T): { data: T } {
  return { data: obj };
}
