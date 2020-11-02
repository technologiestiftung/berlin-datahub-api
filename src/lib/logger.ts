import { createLogger, format, transports } from "winston";
import logdnaWinston from "logdna-winston";
import { LOGDNA_KEY, NODE_ENV } from "./envs";

/**
 * TODO: [DATAHUB-98] Find out why LOGDNA logger creates errors
 * A default logger. Since we are on render we use the LogDNA add-on
 * https://logdna.com/
 *
 * WE keep the old logger around for now to be able to switch back.
 */
export const logger = createLogger({});
const options = {
  key: LOGDNA_KEY,
  hostname: "berlin-datahub-api.onrender.com",
  // ip: ipAddress,
  // mac: macAddress,
  app: `berlin-datahub-${NODE_ENV}`,
  env: NODE_ENV,
  // level: level, // Default to debug, maximum level of log, doc: https://github.com/winstonjs/winston#logging-levels
  indexMeta: true, // Defaults to false, when true ensures meta object will be searchable
};

logger.add(new logdnaWinston(options));
// see https://github.com/winstonjs/winston/blob/master/examples/quick-start.js
// export const logger = createLogger({
//   level: "info",
//   format: format.combine(
//     format.timestamp({
//       format: "YYYY-MM-DD HH:mm:ss",
//     }),
//     format.errors({ stack: true }),
//     format.splat(),
//     format.json(),
//   ),
//   defaultMeta: { service: "berlin-datahub-api" },
//   transports: [
//     //
//     // - Write to all logs with level `info` and below to `quick-start-combined.log`.
//     // - Write all logs error (and below) to `quick-start-error.log`.
//     //
//     new transports.File({
//       filename: "berlin-datahub-api-error.log",
//       level: "error",
//     }),
//     new transports.File({ filename: "berlin-datahub-api-combined.log" }),
//   ],
// });

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}
