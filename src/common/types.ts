import e from "express";

export type HandlerFunction = (
  request: e.Request,
  response: e.Response,
) => Promise<void>;
