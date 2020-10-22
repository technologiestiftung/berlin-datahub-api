/* eslint-disable @typescript-eslint/no-var-requires */
const utlities = require("@inpyjamas/scripts/dist/utlities");
const config = require("@inpyjamas/scripts/jest");
module.exports = utlities.merge(config, {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
});
