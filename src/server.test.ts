import request from "supertest";
import { server } from "./server";
import { prisma } from "./lib/prisma";
// import { cleanUpDB } from "./test/helpers";

describe("supertest default routes", () => {
  afterEach(async () => {
    jest.resetModules();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });
  // afterEach(async () => {});
  test("should get devices on /api/devices", async () => {
    const response = await request(server).get("/api/devices");
    expect(response.status).toBe(200);
    expect(response.body).toMatchInlineSnapshot(`
          Object {
            "data": Object {
              "devices": Array [],
            },
          }
        `);
    // await cleanUpDB(["Device"]);
  });
  test("should get devices on /api/v1/devices", async () => {
    const response = await request(server).get("/api/v1/devices");
    expect(response.status).toBe(200);
    expect(response.body).toMatchInlineSnapshot(`
          Object {
            "data": Object {
              "devices": Array [],
            },
          }
        `);
    // await cleanUpDB(["Device"]);
  });
  test("should return the healthcheck object and have status 200", async () => {
    const response = await request(server).get("/api/healthcheck");
    expect(response.status).toBe(200);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "message": "Berlin DataHub API",
        },
      }
    `);
  });
  test("should return 200 and status /", async () => {
    const response = await request(server).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "message": "Berlin DataHub API",
        },
      }
    `);
  });
  test("should return 200 and status /api", async () => {
    const response = await request(server).get("/api");
    expect(response.status).toBe(200);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "message": "Berlin DataHub API",
        },
      }
    `);
  });
  // eslint-disable-next-line jest/expect-expect
  test("should return 200 and status /api with Deprecation header", async () => {
    await request(server).get("/api").expect("Deprecation", "true");
  });
  // eslint-disable-next-line jest/expect-expect
  test("should return 200 and status /api without Deprecation header", async () => {
    const res = await request(server).get("/api/v1");
    expect(res.headers.Deprecation).not.toBeDefined();
  });
  test("should return 200 status /api/v1", async () => {
    const response = await request(server).get("/api/v1");
    expect(response.status).toBe(200);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "message": "Berlin DataHub API",
        },
      }
    `);
  });
});
