import createError from "http-errors";
import { Device, Record } from "@prisma/client";
import { createPayload } from "../utils";
import { prisma } from "../prisma";
import { HandlerFunction } from "../../common/types";
import { logger } from "../logger";

/**
 * GET all records from a device
 */
export const getRecords: HandlerFunction = async (_request, response) => {
  const device = response.locals.device as Device;
  const records = await prisma.record.findMany({
    where: { deviceId: device.id },
  });
  response.status(201).json(createPayload({ records }));
};

/**
 * Special handler that allows posting data directly from the TTN network into the DB.
 * We use the HTTP Integration from thethingsnetwork.org
 * https://www.thethingsnetwork.org/docs/applications/http/
 *
 * Prerequisites:
 *
 * - You need to have an user account on thethingsnetwork.org
 * - You need to have a user for this API
 * - You need to have an API Token from this API
 * - You need to setup a payload format decoder that adds
 *  the payload_fields.value property
 *
 * This will allow to POST data to this route.
 *
 * You should find more information on this in the README of the repo on GitHub
 */
export const postRecordsFromTTNHTTPIntegration: HandlerFunction = async (
  request,
  response,
) => {
  // TODO: [DATAHUB-92] Casting removes the tests for types and makes the code pass
  const { dev_id, payload_fields, metadata } = request.body;
  logger.log("info", "TTN device sending data", request.body);
  if (!dev_id || typeof dev_id !== "string") {
    throw createError(400, `dev_id not defined or not a string`);
  }
  if (!metadata) {
    throw createError(400, `metadata not defined`);
  }

  if (!metadata.time) {
    throw createError(400, `metadata.time not defined`);
  }
  if (isNaN(Date.parse(metadata.time))) {
    throw createError(400, `metadata time could not be parsed into date`);
  }

  let value = 0;
  const devices = await prisma.device.findMany({
    where: { ttnDeviceId: dev_id },
  });

  if (devices.length === 0) {
    throw createError(400, `This device does not exist`);
  }

  // update lat lon of the device
  if (metadata.latitude) {
    if (metadata.longitude) {
      if (
        typeof metadata.latitude !== "number" ||
        typeof metadata.longitude !== "number"
      ) {
        throw createError(400, "latitude or longitude are not a number");
      }
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
    throw createError(
      400,
      "payload_fields.value is not a number or not defined",
    );
  }
  value = payload_fields.value;
  const record = await prisma.record.create({
    data: {
      value,
      recordedAt: metadata.time,
      Device: { connect: { id: devices[0].id } },
    },
  });
  response.status(201).json(createPayload({ record }));
};

/**
 * allows to POST a record. Depends on lib/middlewares/deviceCheck
 *
 */
export const postRecord: HandlerFunction = async (request, response) => {
  const { value, recordedAt } = request.body;
  if (!value || typeof value !== "number") {
    throw createError(400, `value is not defined or not a number`);
  }
  if (!recordedAt || typeof recordedAt !== "string") {
    throw createError(
      400,
      `record value is not defined or not a string should be parsable as ISOString e.g. const str = new Date("2020-10-10").toISOString()
      `,
    );
  }
  // TODO: [DATAHUB-88] Needs some error handling for the
  // DateTime parsing https://github.com/prisma/prisma-client-js/issues/656
  const device = response.locals.device as Device;

  const record = await prisma.record.create({
    data: { value, recordedAt, Device: { connect: { id: device.id } } },
  });
  response.status(201).json(createPayload({ record }));
};

/**
 * GET a record by its ID
 *
 */
export const getRecordById: HandlerFunction = async (_request, response) => {
  const record = response.locals.record as Record;
  response.json(createPayload({ record }));
};
