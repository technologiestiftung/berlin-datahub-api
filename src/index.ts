import express from "express";
import cors from "cors";
import morgan from "morgan";
import {
  asyncMiddlewareWrapper,
  asyncWrapper,
  errorHandler,
} from "./lib/utils";
import {
  getDeviceById,
  getDevices,
  getRecordById,
  getRecords,
  postDevice,
  postRecord,
  postRecordByTTNId,
} from "./lib/request-handlers";
import { deviceCheck, recordCheck } from "./lib/middlewares";
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/healthcheck", (req, res) => {
  res.json({ status: "active" });
});

app.get("/api/devices", asyncWrapper(getDevices));
app.post("/api/devices", asyncWrapper(postDevice));
app.get(
  "/api//devices/:deviceId([0-9]+)",
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
  asyncMiddlewareWrapper(deviceCheck),
  asyncWrapper(postRecord),
);

app.post(
  "/api/devices/insert-record-by-ttn-device-id",
  // asyncMiddlewareWrapper(deviceCheck),
  asyncWrapper(postRecordByTTNId),
);

app.get(
  "/api/devices/:deviceId([0-9]+)/records/:recordId([0-9]+)",
  asyncMiddlewareWrapper(deviceCheck),
  asyncMiddlewareWrapper(recordCheck),
  asyncWrapper(getRecordById),
);

// TODO: Catch all
// app.get("/api/records-by-app-id/", (req, res) => {
//   const appId = req.query.appId;
// });

// or const { PrismaClient } = require('@prisma/client')

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
