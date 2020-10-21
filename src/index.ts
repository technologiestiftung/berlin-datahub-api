import createError from "http-errors";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signup,
} from "./lib/request-handlers";
import { authCheck, deviceCheck, recordCheck } from "./lib/middlewares";
import helmet from "helmet";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
});
const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1h minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});
const app = express();
const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
}
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

app.get("/api/devices", generalLimiter, asyncWrapper(getDevices));
app.post(
  "/api/devices",
  asyncMiddlewareWrapper(authCheck),
  asyncWrapper(postDevice),
);
app.get(
  "/api/devices/:deviceId([0-9]+)",
  generalLimiter,
  asyncMiddlewareWrapper(deviceCheck),
  asyncWrapper(getDeviceById),
);
app.get(
  "/api/devices/:deviceId([0-9]+)/records",
  generalLimiter,
  asyncMiddlewareWrapper(deviceCheck),
  asyncWrapper(getRecords),
);
app.post(
  "/api/devices/:deviceId([0-9]+)/records",
  generalLimiter,
  asyncMiddlewareWrapper(authCheck),
  asyncMiddlewareWrapper(deviceCheck),
  asyncWrapper(postRecord),
);

app.post(
  "/api/devices/insert-record-by-ttn-device-id",
  generalLimiter,
  // asyncMiddlewareWrapper(deviceCheck),
  asyncMiddlewareWrapper(authCheck),
  asyncWrapper(postRecordByTTNId),
);

app.get(
  "/api/devices/:deviceId([0-9]+)/records/:recordId([0-9]+)",
  generalLimiter,
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
  generalLimiter,
  asyncMiddlewareWrapper(authCheck),
  asyncWrapper(postRecordsFromTTNHTTPIntegration),
);

// corrently this is not available in production
app.post(
  "/api/signup",
  signupLimiter,
  (req, res) => {
    res.json(
      createPayload({
        message: "Signup not possible at the moment. Come back another day",
      }),
    );
  },
  /**
   * currently we don't allow signups
   * maybe in the future
   */
  // asyncWrapper(signup),
);

app.post("/api/login", loginLimiter, asyncWrapper(login));
app.get(
  "/api/profile",
  generalLimiter,
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
