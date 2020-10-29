/**
 * To make sure the needed environment variables are set we assert here on them and throw errors when they are not present.
 *
 */

if (process.env.APP_SECRET === undefined) {
  throw new Error("Environment varibale 'APP_SECRET' is not defined");
}
if (process.env.LOGDNA_KEY === undefined) {
  throw new Error("Environment varibale 'LOGDNA_KEY' is not defined");
}
if (process.env.NODE_ENV === undefined) {
  throw new Error("Environment varibale 'NODE_ENV' is not defined");
}

const APP_SECRET = process.env.APP_SECRET;
const LOGDNA_KEY = process.env.LOGDNA_KEY;
const NODE_ENV = process.env.NODE_ENV;
/**
 * export the env variables
 */
export { APP_SECRET, LOGDNA_KEY, NODE_ENV };
