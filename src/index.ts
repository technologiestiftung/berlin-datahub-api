import express from "express";
import cors from "cors";
import morgan from "morgan";
import {
  asyncMiddlewareWrapper,
  asyncWrapper,
  errorHandler,
} from "./lib/utils";
import {
  getApplicationById,
  getApplications,
  getDeviceById,
  getDevices,
  getRecordById,
  getRecords,
  postApplication,
  postDevice,
  postRecord,
} from "./lib/request-handlers";
import { applicationCheck, deviceCheck, recordCheck } from "./lib/middlewares";
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/healthcheck", (req, res) => {
  res.json({ status: "active" });
});

app.get("/api/applications", asyncWrapper(getApplications));
app.post("/api/applications", asyncWrapper(postApplication));
app.get(
  "/api/applications/:appId([0-9]+)",
  asyncMiddlewareWrapper(applicationCheck),
  asyncWrapper(getApplicationById),
);

app.get(
  "/api/applications/:appId([0-9]+)/devices",
  asyncMiddlewareWrapper(applicationCheck),
  asyncWrapper(getDevices),
);
app.post(
  "/api/applications/:appId([0-9]+)/devices",
  asyncMiddlewareWrapper(applicationCheck),
  asyncWrapper(postDevice),
);
app.get(
  "/api/applications/:appId([0-9]+)/devices/:deviceId([0-9]+)",
  asyncMiddlewareWrapper(applicationCheck),
  asyncMiddlewareWrapper(deviceCheck),
  asyncWrapper(getDeviceById),
);
app.get(
  "/api/applications/:appId([0-9]+)/devices/:deviceId([0-9]+)/records",
  asyncMiddlewareWrapper(applicationCheck),
  asyncMiddlewareWrapper(deviceCheck),
  asyncWrapper(getRecords),
);
app.post(
  "/api/applications/:appId([0-9]+)/devices/:deviceId([0-9]+)/records",
  asyncMiddlewareWrapper(applicationCheck),
  asyncMiddlewareWrapper(deviceCheck),
  asyncWrapper(postRecord),
);
app.get(
  "/api/applications/:appId([0-9]+)/devices/:deviceId([0-9]+)/records/:recordId([0-9]+)",
  asyncMiddlewareWrapper(applicationCheck),
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
