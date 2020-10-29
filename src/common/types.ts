import e from "express";

export type HandlerFunction = (
  request: e.Request,
  response: e.Response,
) => Promise<void>;

// export type MiddlewareFunction = (
//   req: e.Request,
//   res: e.Response,
//   next: e.NextFunction,
// ) => Promise<any> | any;

export type AsyncMiddlewareFunction = (
  request: e.Request,
  response: e.Response,
  next: e.NextFunction,
) => Promise<void>;

export type MiddlewareFunction = (
  request: e.Request,
  response: e.Response,
  next: e.NextFunction,
) => void;
