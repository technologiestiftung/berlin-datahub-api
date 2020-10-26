import { createLogger, format, transports } from "winston";
import logdnaWinston from "logdna-winston";
export const logger = createLogger({});
const options = {
  key: process.env.LOGDNA_KEY,
  hostname: "berlin-datahub-api.onrender.com",
  // ip: ipAddress,
  // mac: macAddress,
  app: `berlin-datahub-${process.env.NODE_ENV}`,
  env: process.env.NODE_ENV,
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

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}
