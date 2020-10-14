import createError from "http-errors";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import {
  asyncMiddlewareWrapper,
  asyncWrapper,
  createPayload,
  errorHandler,
} from "./lib/utils";
import {
  getDeviceById,
  getDevices,
  getRecordById,
  getRecords,
  login,
  postDevice,
  postRecord,
  postRecordByTTNId,
  postRecordsFromTTNHTTPIntegration,
  profile,
  signup,
  // signup,
} from "./lib/request-handlers";
import { authCheck, deviceCheck, recordCheck } from "./lib/middlewares";
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// make morgan skip the healthcheck https://github.com/expressjs/morgan#skip

const logType = process.env.NODE_ENV === "development" ? "dev" : "combined";
app.use(
  morgan(logType, {
    skip: function (req, _res) {
      if (req.url == "/api/healthcheck") {
        return true;
      } else {
        return false;
      }
    },
  }),
);

app.get("/api/healthcheck", (req, res) => {
  res.json({ status: "active" });
});

app.get("/api/devices", asyncWrapper(getDevices));
app.post(
  "/api/devices",
  asyncMiddlewareWrapper(authCheck),
  asyncWrapper(postDevice),
);
app.get(
  "/api/devices/:deviceId([0-9]+)",
  asyncMiddlewareWrapper(deviceCheck),
  asyncWrapper(getDeviceById),
);
app.get(
  "/api/devices/:deviceId([0-9]+)/records",
  asyncMiddlewareWrapper(deviceCheck),
  asyncWrapper(getRecords),
);
app.post(
  "/api/devices/:deviceId([0-9]+)/records",
  asyncMiddlewareWrapper(authCheck),
  asyncMiddlewareWrapper(deviceCheck),
  asyncWrapper(postRecord),
);

app.post(
  "/api/devices/insert-record-by-ttn-device-id",
  // asyncMiddlewareWrapper(deviceCheck),
  asyncMiddlewareWrapper(authCheck),
  asyncWrapper(postRecordByTTNId),
);

app.get(
  "/api/devices/:deviceId([0-9]+)/records/:recordId([0-9]+)",
  asyncMiddlewareWrapper(deviceCheck),
  asyncMiddlewareWrapper(recordCheck),
  asyncWrapper(getRecordById),
);

// app.post(
//   "/api/ttn-http-integration",
//   asyncMiddlewareWrapper(authCheck),
//   asyncWrapper(async (request, response) => {
//     console.log("headers", request.headers);
//     console.log("body", request.body);
//     const { payload_raw } = request.body;
//     const buff = Buffer.from(payload_raw, "base64");
//     const data = buff.toString("hex");
//     // type EncodingType = "hex" | "utf8";
//     // const convert = (from: EncodingType, to: EncodingType) => (str: string) =>
//     //   Buffer.from(str, from).toString(to);
//     // const utf8ToHex = convert("utf8", "hex");
//     // const hexToUtf8 = convert("hex", "utf8");
//     console.log("data", data);
//     response.json(createPayload({ message: "data received" }));
//   }),
// );

app.post(
  "/api/ttn-http-integration",
  asyncMiddlewareWrapper(authCheck),
  asyncWrapper(postRecordsFromTTNHTTPIntegration),
);

// app.post("/api/signup", asyncWrapper(signup));
app.post("/api/login", asyncWrapper(login));
app.get(
  "/api/profile",
  asyncMiddlewareWrapper(authCheck),
  asyncWrapper(profile),
);

// or const { PrismaClient } = require('@prisma/client')
/**
 * Falltrhough cases
 *
 */
app.use((_req, _res, next) => {
  next(createError(404, "wrong route"));
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
