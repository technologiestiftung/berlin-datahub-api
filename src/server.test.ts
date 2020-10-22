import request from "supertest";
import { server } from "./server";
import { prisma } from "./lib/prisma";
// import { cleanUpDB } from "./test/helpers";

describe("supertest default routes", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });
  // afterEach(async () => {});
  test("should get devices", async () => {
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
  test("should return the healthcheck object and have status 200", async () => {
    const response = await request(server).get("/api/healthcheck");
    expect(response.status).toBe(200);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "status": "active",
      }
    `);
  });
  test("should return 404 and message is wrong route on /", async () => {
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
  test("should return 404 and message is wrong route on /api", async () => {
    const response = await request(server).get("/api");
    expect(response.status).toBe(404);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "message": "wrong route",
        "status": 404,
      }
    `);
  });
});
