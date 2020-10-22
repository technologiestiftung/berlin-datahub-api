if (process.env.APP_SECRET === undefined) {
  throw new Error("APP_SECRET is not defined");
}
const APP_SECRET = process.env.APP_SECRET;
export { APP_SECRET };
