import { setupRequest, setupResponse } from "../../test/helpers";
import { prisma } from "../prisma";
import { getProjects, getProjectsById, postProject } from "./projects";

describe("project handlers", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });
  afterEach(async () => {
    await prisma.$executeRaw("DELETE from 'Device'");
    await prisma.$executeRaw("DELETE from 'Project'");
    await prisma.$executeRaw("DELETE from 'Record'");
    await prisma.$executeRaw("DELETE from 'User'");
  });
  test("should return project", async () => {
    const project = await prisma.project.create({
      data: { title: "123", description: "123" },
    });
    const req = setupRequest();
    const res = setupResponse({ locals: { project } });
    await expect(getProjectsById(req, res)).resolves.toBeUndefined();
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ data: { project } });
  });
  test("should return project[]", async () => {
    const user = await prisma.user.create({
      data: { username: "123", password: "123" },
    });
    const project = await prisma.project.create({
      data: { title: "123", description: "123" },
    });
    const req = setupRequest();
    const res = setupResponse({ locals: { user: { userId: user.id } } });
    await expect(getProjects(req, res)).resolves.toBeUndefined();
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ data: { projects: [project] } });
  });

  test("should create new project", async () => {
    const user = await prisma.user.create({
      data: { username: "123", password: "123" },
    });
    const req = setupRequest({
      body: {
        title: "123",
        description: "123",
        ttnAppId: "foo",
        city: "berlin",
      },
    });
    const res = setupResponse({ locals: { user: { userId: user.id } } });
    await expect(postProject(req, res)).resolves.toBeUndefined();
    expect(res.json).toHaveBeenCalledTimes(1);
    // expect(res.json).toHaveBeenCalledWith({ data: { projects: [project] } });
  });

  test("should create new project without ttnAppId and city", async () => {
    const user = await prisma.user.create({
      data: { username: "123", password: "123" },
    });
    const req = setupRequest({
      body: {
        title: "123",
        description: "123",
        // ttnAppId: "foo",
        // city: "berlin",
      },
    });
    const res = setupResponse({ locals: { user: { userId: user.id } } });
    await expect(postProject(req, res)).resolves.toBeUndefined();
    expect(res.json).toHaveBeenCalledTimes(1);
    // expect(res.json).toHaveBeenCalledWith({ data: { projects: [project] } });
  });

  test("should throw: title is not defined or not a string", async () => {
    const req = setupRequest({
      body: {
        // title: 123,
        description: "123",
        ttnAppId: "foo",
        city: "berlin",
      },
    });
    const res = setupResponse({ locals: { user: { userId: 1 } } });
    await expect(postProject(req, res)).rejects.toThrow(
      "title is not defined or not a string",
    );
  });
  test("should throw: title is not defined or not a string (wrong type)", async () => {
    const req = setupRequest({
      body: {
        title: 123,
        description: "123",
        ttnAppId: "foo",
        city: "berlin",
      },
    });
    const res = setupResponse({ locals: { user: { userId: 1 } } });
    await expect(postProject(req, res)).rejects.toThrow(
      "title is not defined or not a string",
    );
  });
  test("should throw: description is not defined or not a string", async () => {
    const req = setupRequest({
      body: {
        title: "123",
        description: 123,
        ttnAppId: "foo",
        city: "berlin",
      },
    });
    const res = setupResponse({ locals: { user: { userId: 1 } } });
    await expect(postProject(req, res)).rejects.toThrow(
      "description is not defined or not a string",
    );
  });

  test("should throw: ttnAppId is not a string", async () => {
    const req = setupRequest({
      body: {
        title: "123",
        description: "123",
        ttnAppId: true,
        city: "berlin",
      },
    });
    const res = setupResponse({ locals: { user: { userId: 1 } } });
    await expect(postProject(req, res)).rejects.toThrow(
      "ttnAppId is not a string",
    );
  });
  test("should throw: city is not a string", async () => {
    const req = setupRequest({
      body: {
        title: "123",
        description: "123",
        ttnAppId: "123",
        city: true,
      },
    });
    const res = setupResponse({ locals: { user: { userId: 1 } } });
    await expect(postProject(req, res)).rejects.toThrow("city is not a string");
  });
  test("should throw: How did you get here? (due to missing user)", async () => {
    const req = setupRequest({
      body: {
        title: "123",
        description: "123",
        ttnAppId: "123",
        city: "true",
      },
    });
    const res = setupResponse({ locals: { user: { userId: 1000 } } });
    await expect(postProject(req, res)).rejects.toThrow(
      "How did you get here?",
    );
  });
});
