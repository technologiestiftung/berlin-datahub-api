import { NextFunction, Request, Response } from "express";
import createError from "http-errors";

// taken from https://zellwk.com/blog/async-await-express/
export function asyncWrapper(
  callback: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return function (req, res, next): void {
    callback(req, res, next).catch(next);
  };
}

/**
 * Taken from https://github.com/tranvansang/middleware-async
 *
 */

export const asyncMiddlewareWrapper = (
  middleware: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<any> | any,
) => (req: Request, res: Response, next: NextFunction) => {
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
    console.error("In Error Handler", error);
  }
  // console.error(error);
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
