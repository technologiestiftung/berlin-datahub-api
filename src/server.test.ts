import request from "supertest";
import { server } from "./server";
describe("supertest default routes", () => {
  test("should return the healthcheck object and have status 200", async () => {
    const response = await request(server).get("/api/healthcheck");
    expect(response.status).toBe(200);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "status": "active",
      }
    `);
  });
  test("should return 404 and message is wrong route", async () => {
    const response = await request(server).get("/");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("wrong route");
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "message": "wrong route",
        "status": 404,
      }
    `);
  });
});
