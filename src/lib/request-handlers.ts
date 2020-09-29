import { hash, compare } from "bcrypt";
import { sign, SignOptions } from "jsonwebtoken";
import createError from "http-errors";
import { PrismaClient, Device, Record } from "@prisma/client";
import { Handler, Request, Response } from "express";
import _ from "lodash";
import { createPayload } from "./utils";
const prisma = new PrismaClient();
const APP_SECRET = process.env.APP_SECRET || "superdupersecret";

type HandlerFunction = (request: Request, response: Response) => Promise<void>;

const tokenSignOpts: SignOptions = {
  algorithm: "HS256",
  expiresIn: "7d",
};
// export const getApplications: HandlerFunction = async (_request, response) => {
//   const applications = await prisma.application.findMany();
//   response.json(createPayload({ applications }));
// };

// export const postApplication: HandlerFunction = async (request, response) => {
//   console.log(request.body);
//   const { name, applicationKey, description } = request.body;
//   if (!name || typeof name !== "string") {
//     throw createError(400, `application name is not defined or not a string`);
//   }
//   if (!applicationKey || typeof applicationKey !== "string") {
//     throw createError(
//       400,
//       `application applicationkey is not defined or not a string`,
//     );
//   }

//   // if (!description && typeof description !== "string") {
//   //   throw createError(400, `description is not a string`);
//   // }

//   const application = await prisma.application.create({
//     data: { name, applicationKey, description },
//   });
//   response.status(201).json(createPayload({ application }));
// };

// export const getApplicationById: HandlerFunction = async (
//   _request,
//   response,
// ) => {
//   const application = response.locals.application as Application;
//   response.json(createPayload({ application }));
// };

export const getDevices: HandlerFunction = async (_request, response) => {
  // const application = response.locals.application as Application;
  const devices = await prisma.device.findMany();
  response.json(createPayload({ devices }));
};

export const postDevice: Handler = async (request, response) => {
  // const application = response.locals.application as Application;
  const { description, ttnDeviceId, ttnAppId } = request.body;
  if (!ttnDeviceId || typeof name !== "string") {
    throw createError(400, `device ttnDeviceId is not defined or not a string`);
  }
  if (!ttnAppId || typeof name !== "string") {
    throw createError(400, `device ttnAppId is not defined or not a string`);
  }

  const device = await prisma.device.create({
    data: {
      ttnDeviceId,
      ttnAppId,
      description,
    },
  });
  response.status(201).json(createPayload({ device }));
};

export const getDeviceById: HandlerFunction = async (_request, response) => {
  const device = response.locals.device as Device;
  response.json(createPayload({ device }));
};

export const getRecords: HandlerFunction = async (_request, response) => {
  const device = response.locals.device as Device;
  const records = await prisma.record.findMany({
    where: { deviceId: device.id },
  });
  response.status(201).json(createPayload({ records }));
};

export const postRecordByTTNId: HandlerFunction = async (request, response) => {
  const { ttnDeviceId, value, recordedAt } = request.body;
  if (!ttnDeviceId && typeof ttnDeviceId !== "string") {
    throw createError(400, `ttn device id not defined or not a string`);
  }
  if (!value && typeof value !== "string") {
    throw createError(400, `record value is not defined or not a string`);
  }
  if (!recordedAt && typeof recordedAt !== "string") {
    throw createError(
      400,
      `record value is not defined or not a string should be parsable as ISOString e.g. const str = new Date("2020-10-10").toISOString()
      `,
    );
  }

  const devices = await prisma.device.findMany({
    where: { ttnDeviceId: ttnDeviceId },
  });
  console.log(devices);
  if (devices.length === 0) {
    throw createError(
      400,
      `This device does not exist
      `,
    );
  }

  const record = await prisma.record.create({
    data: { value, recordedAt, Device: { connect: { id: devices[0].id } } },
  });
  response.json(createPayload({ record }));
};
export const postRecord: HandlerFunction = async (request, response) => {
  const { value, recordedAt } = request.body;
  if (!value && typeof value !== "string") {
    throw createError(400, `record value is not defined or not a string`);
  }
  if (!recordedAt && typeof recordedAt !== "string") {
    throw createError(
      400,
      `record value is not defined or not a string should be parsable as ISOString e.g. const str = new Date("2020-10-10").toISOString()
      `,
    );
  }
  // TODO: Needs some error handling for the
  // DateTime parsing
  const device = response.locals.device as Device;

  const record = await prisma.record.create({
    data: { value, recordedAt, Device: { connect: { id: device.id } } },
  });
  response.status(201).json(createPayload({ record }));
};

export const getRecordById: HandlerFunction = async (_request, response) => {
  const record = response.locals.record as Record;
  response.json(createPayload({ record }));
};

export const signup: HandlerFunction = async (request, response) => {
  const { username, password } = request.body;

  if (!username && typeof username !== "string") {
    throw createError(400, "username not provided or not a string");
  }
  if (!password && typeof password !== "string") {
    throw createError(400, "password not provided or not a string");
  }
  const hashedPassword = await hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hashedPassword },
  });

  const token = sign({ userId: user.id }, APP_SECRET, tokenSignOpts);
  response
    .status(201)
    .json(
      createPayload({ user: { id: user.id, username: user.username }, token }),
    );
};

export const login: HandlerFunction = async (request, response) => {
  const { username, password } = request.body;
  if (!username && typeof username !== "string") {
    throw createError(400, "username not provided or not a string");
  }
  if (!password && typeof password !== "string") {
    throw createError(400, "password not provided or not a string");
  }
  const user = await prisma.user.findOne({
    where: {
      username,
    },
  });
  if (!user) {
    throw createError(401, `No user found for email: ${username}`);
  }
  const passwordValid = await compare(password, user.password);
  if (!passwordValid) {
    throw createError(401, `invalid password`);
  }
  const token = sign({ userId: user.id }, APP_SECRET, tokenSignOpts);

  response
    .status(201)
    .json(
      createPayload({ user: { id: user.id, username: user.username }, token }),
    );
};

export const profile: HandlerFunction = async (request, response) => {
  console.log(response.locals.decoded);
  const { userId } = response.locals.decoded;
  const user = await prisma.user.findOne({ where: { id: userId } });
  if (!user) {
    throw createError(401, "not authorized");
  }
  response
    .status(200)
    .json(createPayload({ user: { username: user.username, id: user.id } }));
};
