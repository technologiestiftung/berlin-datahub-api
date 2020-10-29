import { setupRequest, setupResponse } from "../../test/helpers";
import { prisma } from "../prisma";
import { nanoid } from "nanoid";
import { createPayload } from "../utils";
import {
  getDeviceById,
  getDevices,
  getDevicesFromProject,
  postDevice,
} from "./devices";

describe("device handlers", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });
  afterEach(async () => {
    await prisma.$executeRaw("DELETE from 'Device'");
    await prisma.$executeRaw("DELETE from 'Project'");
    await prisma.$executeRaw("DELETE from 'Record'");
  });
  test("getDevices should call res.json", async () => {
    const res = setupResponse();
    const req = setupRequest();
    await getDevices(req, res);
    expect(res.json).toHaveBeenCalledWith({ data: { devices: [] } });
  });
  test("getDevices should call res.json with one device", async () => {
    const res = setupResponse();
    const req = setupRequest();
    await prisma.project.create({
      data: { title: "123", description: "123" },
    });
    const device = await prisma.device.create({
      data: { ttnDeviceId: nanoid() },
    });
    await getDevices(req, res);
    expect(res.json).toHaveBeenCalledWith({ data: { devices: [device] } });
  });

  test("postDevices should call res.json", async () => {
    const project = await prisma.project.create({
      data: {
        title: "Foo",
        description: "foo foo",
      },
    });
    const res = setupResponse();
    const req = setupRequest({
      body: {
        description: "foo",
        ttnDeviceId: "123",
        projectId: project.id,
      },
    });
    await postDevice(req, res);
    expect(res.json).toHaveBeenCalledWith(
      createPayload({
        device: {
          description: "foo",
          id: expect.any(Number),
          latitude: null,
          longitude: null,
          projectId: project.id,
          ttnDeviceId: "123",
        },
      }),
    );
  });

  test("postDevice should throw: projectId is not defined or not a number", async () => {
    const res = setupResponse({});
    const req = setupRequest({ body: {} });
    await expect(postDevice(req, res)).rejects.toThrow(
      "projectId is not defined or not a number",
    );
  });

  test("postDevice should throw: ttnDeviceId is not defined or not a number", async () => {
    const res = setupResponse({});
    const req = setupRequest({ body: { projectId: 1 } });
    await expect(postDevice(req, res)).rejects.toThrow(
      "ttnDeviceId is not defined or not a string",
    );
  });

  test("postDevice should throw: description is defined but not a string", async () => {
    const res = setupResponse({});
    const req = setupRequest({
      body: { ttnDeviceId: "foo", projectId: 1, description: 1 },
    });
    await expect(postDevice(req, res)).rejects.toThrow(
      "description is defined but not a string",
    );
  });

  test("postDevice should throw: latitude is defined but not a number", async () => {
    const res = setupResponse({});
    const req = setupRequest({
      body: {
        ttnDeviceId: "foo",
        projectId: 1,
        description: "foo",
        latitude: true,
      },
    });
    await expect(postDevice(req, res)).rejects.toThrow(
      "latitude is defined but not a number",
    );
  });

  test("postDevice should throw: longitude is defined but not a number", async () => {
    const res = setupResponse({});
    const req = setupRequest({
      body: {
        ttnDeviceId: "foo",
        projectId: 1,
        description: "foo",
        latitude: 1,
        longitude: "1",
      },
    });
    await expect(postDevice(req, res)).rejects.toThrow(
      "longitude is defined but not a number",
    );
  });

  test("postDevice should throw: project with id: ${projectId} does not exist", async () => {
    const res = setupResponse({});
    const req = setupRequest({
      body: {
        ttnDeviceId: "foo",
        projectId: 1,
        description: "foo",
        latitude: 1,
        longitude: 1,
      },
    });
    await expect(postDevice(req, res)).rejects.toThrow(
      `project with id: ${req.body.projectId} does not exist`,
    );
  });

  test("should call res.json with res locals device", async () => {
    const res = setupResponse({ locals: { device: { id: 1 } } });
    const req = setupRequest();
    await getDeviceById(req, res);
    expect(res.json).toHaveBeenCalledWith(
      createPayload({ device: res.locals.device }),
    );
  });
  test("should should call res.json with project devices", async () => {
    const project = await prisma.project.create({
      data: {
        title: "Foo",
        description: "foo foo",
      },
    });
    const res = setupResponse({ locals: { project: { id: project.id } } });
    const req = setupRequest();
    await getDevicesFromProject(req, res);
    expect(res.json).toHaveBeenCalledWith(createPayload({ devices: [] }));
  });
});
