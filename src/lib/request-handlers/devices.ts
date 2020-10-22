import { Device, Project } from "@prisma/client";
import createError from "http-errors";

import { HandlerFunction } from "../../common/types";
import { prisma } from "../prisma";
import { createPayload } from "../utils";

export const getDevices: HandlerFunction = async (_request, response) => {
  // const application = response.locals.application as Application;
  const devices = await prisma.device.findMany();
  response.json(createPayload({ devices }));
};

export const postDevice: HandlerFunction = async (request, response) => {
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
