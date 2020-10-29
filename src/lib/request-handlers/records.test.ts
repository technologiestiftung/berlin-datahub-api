import { setupRequest, setupResponse } from "../../test/helpers";
import { prisma } from "../prisma";
import {
  getRecordById,
  getRecords,
  postRecord,
  postRecordsFromTTNHTTPIntegration,
} from "./records";

describe("record handlers", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });
  afterEach(async () => {
    await prisma.$executeRaw("DELETE from 'Device'");
    await prisma.$executeRaw("DELETE from 'Project'");
    await prisma.$executeRaw("DELETE from 'Record'");
  });
  test("should return record[]", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });
    const req = setupRequest();
    const res = setupResponse({ locals: { device } });
    await expect(getRecords(req, res)).resolves.toBeUndefined();
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ data: { records: [] } });
  });

  test("should return record undefined", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });
    const req = setupRequest({ params: { recordId: "1" } });
    const res = setupResponse({ locals: { device } });
    await expect(getRecordById(req, res)).resolves.toBeUndefined();
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ data: { record: undefined } });
  });

  test("should create a record", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });
    const req = setupRequest({
      body: { value: 1, recordedAt: new Date().toISOString() },
    });
    const res = setupResponse({ locals: { device } });
    await expect(postRecord(req, res)).resolves.toBeUndefined();
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        record: {
          deviceId: expect.any(Number),
          id: expect.any(Number),
          recordedAt: expect.any(Date),
          value: req.body.value,
        },
      },
    });
  });
  test("should throw: value is not defined or not a number", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });
    const req = setupRequest({
      body: { value: "1", recordedAt: new Date().toISOString() },
    });
    const res = setupResponse({ locals: { device } });
    await expect(postRecord(req, res)).rejects.toThrow(
      "value is not defined or not a number",
    );
  });
  test("should throw: date warning", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });
    const req = setupRequest({
      body: { value: 1, recordedAt: 133 },
    });
    const res = setupResponse({ locals: { device } });
    await expect(postRecord(req, res)).rejects.toThrow(
      `record value is not defined or not a string should be parsable as ISOString e.g. const str = new Date("2020-10-10").toISOString()
      `,
    );
  });
  test("should create a record through TTN integration", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });

    const req = setupRequest({
      body: {
        dev_id: device.ttnDeviceId,
        metadata: {
          time: new Date().toISOString(),
          latitude: 13,
          longitude: 13,
          altitude: 3,
        },
        payload_fields: { value: 1 },
      },
    });

    const res = setupResponse({ locals: { device } });
    await expect(
      postRecordsFromTTNHTTPIntegration(req, res),
    ).resolves.toBeUndefined();
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        record: {
          deviceId: expect.any(Number),
          id: expect.any(Number),
          recordedAt: expect.any(Date),
          value: req.body.payload_fields.value,
        },
      },
    });
  });

  test("should throw on TTN integration: dev_id not defined or not a string", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });

    const req = setupRequest({
      body: {
        // dev_id: device.ttnDeviceId,
        metadata: {
          time: new Date().toISOString(),
          latitude: 13,
          longitude: 13,
          altitude: 3,
        },
        payload_fields: { value: 1 },
      },
    });

    const res = setupResponse({ locals: { device } });
    await expect(postRecordsFromTTNHTTPIntegration(req, res)).rejects.toThrow(
      "dev_id not defined or not a string",
    );
  });
  test("should throw on TTN integration: metadata not defined", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });

    const req = setupRequest({
      body: {
        dev_id: device.ttnDeviceId,
        // metadata: {
        //   time: new Date().toISOString(),
        //   latitude: 13,
        //   longitude: 13,
        //   altitude: 3,
        // },
        payload_fields: { value: 1 },
      },
    });

    const res = setupResponse({ locals: { device } });
    await expect(postRecordsFromTTNHTTPIntegration(req, res)).rejects.toThrow(
      "metadata not defined",
    );
  });
  test("should throw on TTN integration: metadata.time not defined", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });

    const req = setupRequest({
      body: {
        dev_id: device.ttnDeviceId,
        metadata: {
          // time: new Date().toISOString(),
          latitude: 13,
          longitude: 13,
          altitude: 3,
        },
        payload_fields: { value: 1 },
      },
    });

    const res = setupResponse({ locals: { device } });
    await expect(postRecordsFromTTNHTTPIntegration(req, res)).rejects.toThrow(
      "metadata.time not defined",
    );
  });
  test("should throw on TTN integration: metadata time could not be parsed into date", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });

    const req = setupRequest({
      body: {
        dev_id: device.ttnDeviceId,
        metadata: {
          time: true,
          latitude: 13,
          longitude: 13,
          altitude: 3,
        },
        payload_fields: { value: 1 },
      },
    });

    const res = setupResponse({ locals: { device } });
    await expect(postRecordsFromTTNHTTPIntegration(req, res)).rejects.toThrow(
      "metadata time could not be parsed into date",
    );
  });
  test("should throw on TTN integration: This device does not exist", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });

    const req = setupRequest({
      body: {
        dev_id: "bounce",
        metadata: {
          time: new Date().toISOString(),
          latitude: 13,
          longitude: 13,
          altitude: 3,
        },
        payload_fields: { value: 1 },
      },
    });

    const res = setupResponse({ locals: { device } });
    await expect(postRecordsFromTTNHTTPIntegration(req, res)).rejects.toThrow(
      "This device does not exist",
    );
  });

  test("should throw on TTN integration: payload_fields not defined", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });

    const req = setupRequest({
      body: {
        dev_id: "foo",
        metadata: {
          time: new Date().toISOString(),
          latitude: 13,
          longitude: 13,
          altitude: 3,
        },
        // payload_fields: { value: 1 },
      },
    });

    const res = setupResponse({ locals: { device } });
    await expect(postRecordsFromTTNHTTPIntegration(req, res)).rejects.toThrow(
      "payload_fields not defined",
    );
  });
  test("should throw on TTN integration: latitude or longitude are not a number (lat)", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });

    const req = setupRequest({
      body: {
        dev_id: "foo",
        metadata: {
          time: new Date().toISOString(),
          latitude: "13",
          longitude: 13,
          altitude: 3,
        },
        payload_fields: { value: 1 },
      },
    });

    const res = setupResponse({ locals: { device } });
    await expect(postRecordsFromTTNHTTPIntegration(req, res)).rejects.toThrow(
      "latitude or longitude are not a number",
    );
  });
  test("should throw on TTN integration: latitude or longitude are not a number (lon)", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });

    const req = setupRequest({
      body: {
        dev_id: "foo",
        metadata: {
          time: new Date().toISOString(),
          latitude: 13,
          longitude: "13",
          altitude: 3,
        },
        payload_fields: { value: 1 },
      },
    });

    const res = setupResponse({ locals: { device } });
    await expect(postRecordsFromTTNHTTPIntegration(req, res)).rejects.toThrow(
      "latitude or longitude are not a number",
    );
  });
  test("should throw on TTN integration: payload_fields.value is not a number", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "foo" } });

    const req = setupRequest({
      body: {
        dev_id: "foo",
        metadata: {
          time: new Date().toISOString(),
          latitude: 13,
          longitude: 13,
          altitude: 3,
        },
        payload_fields: { value: "1" },
      },
    });

    const res = setupResponse({ locals: { device } });
    await expect(postRecordsFromTTNHTTPIntegration(req, res)).rejects.toThrow(
      "payload_fields.value is not a number or not defined",
    );
  });
});
