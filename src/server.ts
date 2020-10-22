import createError from "http-errors";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { router } from "./lib/api-routes";
import { status } from "./lib/request-handlers/status";
import { asyncWrapper, errorHandler } from "./lib/utils";
import { generalLimiter } from "./lib/rate-limiters";

const server = express();
if (process.env.NODE_ENV === "production") {
  server.use(helmet());
}
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
// make morgan skip the healthcheck https://github.com/expressjs/morgan#skip

if (process.env.NODE_ENV !== "test") {
  const logType = process.env.NODE_ENV === "development" ? "dev" : "combined";

  server.use(
    morgan(logType, {
      skip: (req) => req.url === "/api/healthcheck",
    }),
  );
}

server.get("/", generalLimiter, asyncWrapper(status));
server.get("/healthcheck", generalLimiter, asyncWrapper(status));
server.get("/api/healthcheck", generalLimiter, asyncWrapper(status));
server.use("/api", router);

// server.get("/api/devices", generalLimiter, asyncWrapper(getDevices));
// server.post(
//   "/api/devices",
//   asyncMiddlewareWrapper(authCheck),
//   asyncWrapper(postDevice),
// );
// server.get(
//   "/api/devices/:deviceId([0-9]+)",
//   generalLimiter,
//   asyncMiddlewareWrapper(deviceCheck),
//   asyncWrapper(getDeviceById),
// );

// server.get(
//   "/api/devices/:deviceId([0-9]+)/records",
//   generalLimiter,
//   asyncMiddlewareWrapper(deviceCheck),
//   asyncWrapper(getRecords),
// );
// server.post(
//   "/api/devices/:deviceId([0-9]+)/records",
//   generalLimiter,
//   asyncMiddlewareWrapper(authCheck),
//   asyncMiddlewareWrapper(deviceCheck),
//   asyncWrapper(postRecord),
// );

// server.get(
//   "/api/devices/:deviceId([0-9]+)/records/:recordId([0-9]+)",
//   generalLimiter,
//   asyncMiddlewareWrapper(deviceCheck),
//   asyncMiddlewareWrapper(recordCheck),
//   asyncWrapper(getRecordById),
// );

// // ▄▄▄█████▓▄▄▄█████▓ ███▄    █
// // ▓  ██▒ ▓▒▓  ██▒ ▓▒ ██ ▀█   █
// // ▒ ▓██░ ▒░▒ ▓██░ ▒░▓██  ▀█ ██▒
// // ░ ▓██▓ ░ ░ ▓██▓ ░ ▓██▒  ▐▌██▒
// //   ▒██▒ ░   ▒██▒ ░ ▒██░   ▓██░
// //   ▒ ░░     ▒ ░░   ░ ▒░   ▒ ▒
// //     ░        ░    ░ ░░   ░ ▒░
// //   ░        ░         ░   ░ ░
// //                            ░

// server.post(
//   "/api/devices/insert-record-by-ttn-device-id",
//   generalLimiter,
//   // asyncMiddlewareWrapper(deviceCheck),
//   asyncMiddlewareWrapper(authCheck),
//   asyncWrapper(postRecordByTTNId),
// );
// // app.post(
// //   "/api/ttn-http-integration",
// //   asyncMiddlewareWrapper(authCheck),
// //   asyncWrapper(async (request, response) => {
// //     console.log("headers", request.headers);
// //     console.log("body", request.body);
// //     const { payload_raw } = request.body;
// //     const buff = Buffer.from(payload_raw, "base64");
// //     const data = buff.toString("hex");
// //     // type EncodingType = "hex" | "utf8";
// //     // const convert = (from: EncodingType, to: EncodingType) => (str: string) =>
// //     //   Buffer.from(str, from).toString(to);
// //     // const utf8ToHex = convert("utf8", "hex");
// //     // const hexToUtf8 = convert("hex", "utf8");
// //     console.log("data", data);
// //     response.json(createPayload({ message: "data received" }));
// //   }),
// // );

// server.post(
//   "/api/ttn-http-integration",
//   generalLimiter,
//   asyncMiddlewareWrapper(authCheck),
//   asyncWrapper(postRecordsFromTTNHTTPIntegration),
// );

// //  █    ██   ██████ ▓█████  ██▀███
// //  ██  ▓██▒▒██    ▒ ▓█   ▀ ▓██ ▒ ██▒
// // ▓██  ▒██░░ ▓██▄   ▒███   ▓██ ░▄█ ▒
// // ▓▓█  ░██░  ▒   ██▒▒▓█  ▄ ▒██▀▀█▄
// // ▒▒█████▓ ▒██████▒▒░▒████▒░██▓ ▒██▒
// // ░▒▓▒ ▒ ▒ ▒ ▒▓▒ ▒ ░░░ ▒░ ░░ ▒▓ ░▒▓░
// // ░░▒░ ░ ░ ░ ░▒  ░ ░ ░ ░  ░  ░▒ ░ ▒░
// //  ░░░ ░ ░ ░  ░  ░     ░     ░░   ░
// //    ░           ░     ░  ░   ░

// server.post(
//   "/api/signup",
//   signupLimiter,
//   (req, res) => {
//     res.json(
//       createPayload({
//         message: "Signup not possible at the moment. Come back another day",
//       }),
//     );
//   },
//   /**
//    * currently we don't allow signups
//    * maybe in the future
//    */
//   // asyncWrapper(signup),
// );

// server.post("/api/login", loginLimiter, asyncWrapper(login));
// server.get(
//   "/api/profile",
//   generalLimiter,
//   asyncMiddlewareWrapper(authCheck),
//   asyncWrapper(profile),
// );

// ▓█████  ██▀███   ██▀███   ▒█████   ██▀███
// ▓█   ▀ ▓██ ▒ ██▒▓██ ▒ ██▒▒██▒  ██▒▓██ ▒ ██▒
// ▒███   ▓██ ░▄█ ▒▓██ ░▄█ ▒▒██░  ██▒▓██ ░▄█ ▒
// ▒▓█  ▄ ▒██▀▀█▄  ▒██▀▀█▄  ▒██   ██░▒██▀▀█▄
// ░▒████▒░██▓ ▒██▒░██▓ ▒██▒░ ████▓▒░░██▓ ▒██▒
// ░░ ▒░ ░░ ▒▓ ░▒▓░░ ▒▓ ░▒▓░░ ▒░▒░▒░ ░ ▒▓ ░▒▓░
//  ░ ░  ░  ░▒ ░ ▒░  ░▒ ░ ▒░  ░ ▒ ▒░   ░▒ ░ ▒░
//    ░     ░░   ░   ░░   ░ ░ ░ ░ ▒    ░░   ░
//    ░  ░   ░        ░         ░ ░     ░

/**
 * Falltrhough cases
 *
 */
server.use((_req, _res, next) => {
  next(createError(404, "wrong route"));
});
server.use(errorHandler);

// expots
export { server };
