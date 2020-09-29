import { PrismaClient } from "@prisma/client";
import { NextFunction, Response, Request } from "express";
import { verify } from "jsonwebtoken";

import createError from "http-errors";

const APP_SECRET = process.env.APP_SECRET || "superdupersecret";
const prisma = new PrismaClient();

export type MiddlewareFunction = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Middleware that checks for existing devices
 * Needs the asyncMiddlewareWrapper to work
 */
export const deviceCheck: MiddlewareFunction = async (
  request,
  response,
  next,
) => {
  const id = parseInt(request.params.deviceId);
  const device = await prisma.device.findOne({ where: { id: id } });
  if (!device) {
    throw createError(404, `device with id ${id} does not exists`);
  }
  response.locals.device = device;
  next();
};

/**
 * Middleware that checks for existing records
 * Needs the asyncMiddlewareWrapper to work
 */
export const recordCheck: MiddlewareFunction = async (
  request,
  response,
  next,
) => {
  const id = parseInt(request.params.recordId);
  const record = await prisma.record.findOne({ where: { id: id } });
  if (!record) {
    throw createError(404, `record with id ${id} does not exists`);
  }
  response.locals.record = record;
  next();
};

export const authCheck: MiddlewareFunction = async (
  request,
  response,
  next,
) => {
  if (!request.headers.authorization) {
    throw createError(404, `No credentials provided`);
  }
  const token = request.headers.authorization.split(" ")[1];

  const decoded = verify(token, APP_SECRET);
  if (!decoded) {
    throw createError(404, `token invalid`);
  }
  response.locals.decoded = decoded;
  next();
};
