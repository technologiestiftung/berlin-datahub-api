import { verify } from "jsonwebtoken";
import createError from "http-errors";
import { APP_SECRET } from "./envs";
import { prisma } from "./prisma";
import { AsyncMiddlewareFunction } from "../common/types";
// const prisma = new PrismaClient();

/**
 * Middleware that checks for existing devices
 * Needs the asyncMiddlewareWrapper to work
 */
export const deviceCheck: AsyncMiddlewareFunction = async (
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
export const recordCheck: AsyncMiddlewareFunction = async (
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

export const projectCheck: AsyncMiddlewareFunction = async (
  request,
  response,
  next,
) => {
  const id = parseInt(request.params.projectId);
  const project = await prisma.project.findOne({ where: { id: id } });
  if (!project) {
    throw createError(404, `project with id ${id} does not exists`);
  }
  response.locals.project = project;
  next();
};

export const authCheck: AsyncMiddlewareFunction = async (
  request,
  response,
  next,
) => {
  console.log(request.headers.authorization);
  if (!request.headers.authorization) {
    throw createError(401, `No credentials provided`);
  }
  // console.log(request.headers.authorization);
  // console.log("APP_SECRET", APP_SECRET);
  const token = request.headers.authorization.split(" ")[1];

  const decoded = verify(token, APP_SECRET);
  if (!decoded) {
    throw createError(404, `token invalid`);
  }
  response.locals.user = decoded;
  next();
};
