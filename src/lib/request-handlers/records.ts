import createError from "http-errors";
import { Device, Record } from "@prisma/client";
import { createPayload } from "../utils";
import { TTNHTTPPayload } from "../../common/interfaces";
import { prisma } from "../prisma";
import { HandlerFunction } from "../../common/types";

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
  let value = 0;
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
  // if (!payload_fields.value || typeof payload_fields.value !== "number") {
  //   throw createError(400, `value not defined or not a number`);
  // }
  if (payload_fields.value) {
    if (!isNaN(payload_fields.value)) {
      value = payload_fields.value;
    }
  }
  const record = await prisma.record.create({
    data: {
      value,
      recordedAt: metadata.time,
      Device: { connect: { id: devices[0].id } },
    },
  });
  response.status(201).json(createPayload({ record }));
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
