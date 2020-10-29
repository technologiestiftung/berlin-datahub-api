import { prisma } from "./prisma";
import {
  authCheck,
  deviceCheck,
  projectCheck,
  recordCheck,
} from "./middlewares";
import { setupRequest, setupResponse } from "../test/helpers";
import { sign } from "jsonwebtoken";
import { APP_SECRET } from "./envs";
import { tokenSignOpts } from "./request-handlers/users";
describe("middlewares", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });
  afterEach(async () => {
    await prisma.$executeRaw("DELETE from 'Device'");
    await prisma.$executeRaw("DELETE from 'Project'");
    await prisma.$executeRaw("DELETE from 'Record'");
  });

  test("deviceCheck middleware should pass", async () => {
    const device = await prisma.device.create({ data: { ttnDeviceId: "123" } });
    const req = setupRequest({ params: { deviceId: device.id } });
    const res = setupResponse({ locals: {} });
    const next = jest.fn();
    await expect(deviceCheck(req, res, next)).resolves.toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("deviceCheck middleware should throw", async () => {
    const req = setupRequest({ params: { deviceId: "1000" } });
    const res = setupResponse({ locals: {} });
    const next = jest.fn();
    await expect(deviceCheck(req, res, next)).rejects.toThrow(
      `device with id ${req.params.deviceId} does not exists`,
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("projectCheck middleware should pass", async () => {
    const project = await prisma.project.create({
      data: {
        description: "foo",
        title: "foo",
      },
    });
    const req = setupRequest({ params: { projectId: project.id } });
    const res = setupResponse({ locals: {} });
    const next = jest.fn();
    await expect(projectCheck(req, res, next)).resolves.toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
  test("projectCheck middleware should throw", async () => {
    const req = setupRequest({ params: { projectId: "1000" } });
    const res = setupResponse({ locals: {} });
    const next = jest.fn();
    await expect(projectCheck(req, res, next)).rejects.toThrow(
      `project with id ${req.params.projectId} does not exists`,
    );
    expect(next).not.toHaveBeenCalled();
  });
  test("recordCheck middleware should pass", async () => {
    const record = await prisma.record.create({
      data: {
        value: 1,
        recordedAt: new Date().toISOString(),
      },
    });
    const req = setupRequest({ params: { recordId: record.id } });
    const res = setupResponse({ locals: {} });
    const next = jest.fn();
    await expect(recordCheck(req, res, next)).resolves.toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("recordCheck middleware should throw", async () => {
    const req = setupRequest({ params: { recordId: "1000" } });
    const res = setupResponse({ locals: {} });
    const next = jest.fn();
    await expect(recordCheck(req, res, next)).rejects.toThrow(
      `record with id ${req.params.recordId} does not exists`,
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("authCheck middleware should pass", async () => {
    const token = sign({ userId: 1 }, APP_SECRET, tokenSignOpts);
    const req = setupRequest({ headers: { authorization: `Bearer ${token}` } });
    const res = setupResponse({ locals: {} });
    const next = jest.fn();
    await expect(authCheck(req, res, next)).resolves.toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
  test("authCheck middleware should throw: invalid signature", async () => {
    const token = sign({ userId: 1 }, "123", tokenSignOpts);

    const req = setupRequest({ headers: { authorization: `Bearer ${token}` } });
    const res = setupResponse({ locals: {} });
    const next = jest.fn();
    await expect(authCheck(req, res, next)).rejects.toThrow(
      "invalid signature",
    );
    expect(next).not.toHaveBeenCalled();
  });
  test("authCheck middleware should throw: jwt malformed", async () => {
    // const token = sign({ userId: 1 }, "123", tokenSignOpts);

    const req = setupRequest({ headers: { authorization: `Bearer 123` } });
    const res = setupResponse({ locals: {} });
    const next = jest.fn();
    await expect(authCheck(req, res, next)).rejects.toThrow("jwt malformed");
    expect(next).not.toHaveBeenCalled();
  });
  test("authCheck middleware should throw: No credentials provided", async () => {
    // const token = sign({ userId: 1 }, "123", tokenSignOpts);

    const req = setupRequest({ headers: {} });
    const res = setupResponse({ locals: {} });
    const next = jest.fn();
    await expect(authCheck(req, res, next)).rejects.toThrow(
      "No credentials provided",
    );
    expect(next).not.toHaveBeenCalled();
  });
});
