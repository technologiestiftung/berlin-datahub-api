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
server.use("/api/v1", router);

server.use(
  "/api",
  (req, res, next) => {
    console.log("middleware");
    res.append("Deprecation", "true");
    next();
  },
  router,
);

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
