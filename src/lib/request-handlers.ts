import { hash, compare } from "bcrypt";
import { sign, SignOptions } from "jsonwebtoken";
import createError from "http-errors";
import { PrismaClient, Device, Record, Project } from "@prisma/client";
import { Handler, Request, Response } from "express";
import _ from "lodash";
import { createPayload } from "./utils";
import { TTNHTTPPayload } from "../common/interfaces";
const prisma = new PrismaClient();
const APP_SECRET = process.env.APP_SECRET || "superdupersecret";

type HandlerFunction = (request: Request, response: Response) => Promise<void>;

const tokenSignOpts: SignOptions = {
  algorithm: "HS256",
  // expiresIn: "7d",
};

export const getProjects: HandlerFunction = async (_request, response) => {
  const projects = await prisma.project.findMany({});
  response.json(createPayload({ projects }));
};

export const postProject: HandlerFunction = async (request, response) => {
  // console.log(request.body);
  // console.log("user", response.locals.user);
  const { title, ttnAppId, description, city } = request.body;
  const { userId } = response.locals.user as { userId: number };
  if (!title || typeof title !== "string") {
    throw createError(400, `title is not defined or not a string`);
  }
  if (!description || typeof description !== "string") {
    throw createError(400, `description is not defined or not a string`);
  }
  if (ttnAppId) {
    if (typeof ttnAppId !== "string") {
      throw createError(400, `ttnAppId is not a string`);
    }
  }
  if (city) {
    if (typeof city !== "string") {
      throw createError(400, `city is not a string`);
    }
  }
  const user = await prisma.user.findOne({ where: { id: userId } });
  let project: Project;
  if (user) {
    project = await prisma.project.create({
      data: {
        title,
        description,
        User: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  } else {
    throw createError(401, "How did you get here?");
  }

  response.status(201).json(createPayload({ project }));
};

// export const getApplicationById: HandlerFunction = async (
//   _request,
//   response,
// ) => {
//   const application = response.locals.application as Application;
//   response.json(createPayload({ application }));
// };

export const getDevicesFromProject: HandlerFunction = async (
  request,
  response,
) => {
  const project = response.locals.project as Project;
  const devices = await prisma.project
    .findOne({ where: { id: project.id } })
    .devices();
  response.json(createPayload({ devices }));
};
export const getDevices: HandlerFunction = async (_request, response) => {
  // const application = response.locals.application as Application;
  const devices = await prisma.device.findMany();
  response.json(createPayload({ devices }));
};

export const postDevice: Handler = async (request, response) => {
  // const application = response.locals.application as Application;
  const { description, ttnDeviceId, projectId } = request.body;

  if (!ttnDeviceId || typeof ttnDeviceId !== "string") {
    throw createError(400, `ttnDeviceId is not defined or not a string`);
  }

  if (!projectId || typeof projectId !== "number") {
    throw createError(400, `projectId is not defined or not a number`);
  }

  const project = await prisma.project.findOne({ where: { id: projectId } });
  if (!project) {
    throw createError(400, `project with id: ${projectId} does not exist`);
  }
  const device = await prisma.device.create({
    data: {
      ttnDeviceId,
      description,
      Project: {
        connect: { id: projectId },
      },
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

export const postRecordsFromTTNHTTPIntegration: HandlerFunction = async (
  request,
  response,
) => {
  const { dev_id, payload_fields, metadata } = request.body as Partial<
    TTNHTTPPayload
  >;
  if (!dev_id || typeof dev_id !== "string") {
    throw createError(400, `dev_id not defined or not a string`);
  }
  if (!metadata) {
    throw createError(400, `metadata not defined`);
  }
  if (metadata) {
    if (!metadata.time) {
      throw createError(400, `metadata.time not defined`);
    }
    if (isNaN(Date.parse(metadata.time))) {
      throw createError(400, `metadata time could not be parsed into date`);
    }
  }

  const devices = await prisma.device.findMany({
    where: { ttnDeviceId: dev_id },
  });

  console.log(devices);
  if (devices.length === 0) {
    throw createError(400, `This device does not exist`);
  }

  // update lat lon of the device
  if (metadata?.latitude) {
    if (metadata.longitude) {
      await prisma.device.update({
        where: { id: devices[0].id },
        data: {
          latitude: metadata.latitude,
          longitude: metadata.longitude,
        },
      });
    }
  }
  if (!payload_fields) {
    throw createError(400, `payload_fields not defined`);
  }
  if (!payload_fields.value || typeof payload_fields.value !== "number") {
    throw createError(400, `value not defined or not a number`);
  }

  const record = await prisma.record.create({
    data: {
      value: payload_fields?.value,
      recordedAt: metadata.time,
      Device: { connect: { id: devices[0].id } },
    },
  });
  response.json(createPayload({ record }));
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

/**
 * handles user login and returns token if user and password match
 *
 *
 */
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
  const { userId } = response.locals.user;
  const user = await prisma.user.findOne({ where: { id: userId } });
  if (!user) {
    throw createError(401, "not authorized");
  }
  response
    .status(200)
    .json(createPayload({ user: { username: user.username, id: user.id } }));
};
