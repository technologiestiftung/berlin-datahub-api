import { Device, Project } from "@prisma/client";
import createError from "http-errors";

import { HandlerFunction } from "../../common/types";
import { prisma } from "../prisma";
import { createPayload } from "../utils";

/**
 * Use prisma to GET all devices
 */
export const getDevices: HandlerFunction = async (_request, response) => {
  const devices = await prisma.device.findMany();
  response.json(createPayload({ devices }));
};

/**
 * Use prisma to POST a new device
 *
 */
export const postDevice: HandlerFunction = async (request, response) => {
  const {
    description,
    ttnDeviceId,
    projectId,
    latitude,
    longitude,
  } = request.body;

  if (!projectId || typeof projectId !== "number") {
    throw createError(400, `projectId is not defined or not a number`);
  }
  if (!ttnDeviceId && typeof ttnDeviceId !== "string") {
    throw createError(400, `ttnDeviceId is not defined or not a string`);
  }
  if (description) {
    if (typeof description !== "string") {
      throw createError(400, `description is defined but not a number`);
    }
  }
  if (latitude) {
    if (typeof latitude !== "number") {
      throw createError(400, `latitude is defined but not a number`);
    }
  }
  if (longitude) {
    if (typeof longitude !== "number") {
      throw createError(400, `longitude is defined but not a number`);
    }
  }
  const project = await prisma.project.findOne({ where: { id: projectId } });
  if (!project) {
    throw createError(400, `project with id: ${projectId} does not exist`);
  }
  const device = await prisma.device.create({
    data: {
      ttnDeviceId,
      description,
      latitude,
      longitude,
      Project: {
        connect: { id: projectId },
      },
    },
  });
  response.status(201).json(createPayload({ device }));
};

/**
 * specalized function to get device by its id. This function depends on lib/middlewares/deviceCheck to have been called and added the device to response.locals
 * TODO: [DATAHUB-83] Test if response.locals.device really exists if not throw 500 internal error
 *
 */
export const getDeviceById: HandlerFunction = async (_request, response) => {
  const device = response.locals.device as Device;
  response.json(createPayload({ device }));
};

/**
 * Gets all devices that are part of a project depends on
 * lib/middlewares/projectCheck
 *
 */
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
