/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const utlities = require("@inpyjamas/scripts/dist/utlities");
const config = require("@inpyjamas/scripts/jest");
module.exports = utlities.merge(config, {
  testEnvironment: path.join(__dirname, "prisma", "prisma-test-environment.js"),
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
});
