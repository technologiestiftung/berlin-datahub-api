import { HandlerFunction } from "../../common/types";
// import { logger } from "../logger";
import { createPayload } from "../utils";

/**
 * Centralized function for the healthcheck and default route
 *
 */
export const status: HandlerFunction = async (_request, response) => {
  // logger.info(`status ${_request.url}`, { level: "info", foo: "123" });
  response.json(createPayload({ message: "Berlin DataHub API" }));
};
