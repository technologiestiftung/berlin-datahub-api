/* eslint-disable @typescript-eslint/no-var-requires */
const localConfig = {
  rules: {
    "jest/no-hooks": "off",
  },
};
const utlities = require("@inpyjamas/scripts/dist/utlities");
const config = require("@inpyjamas/scripts/eslint");
module.exports = utlities.merge(config, localConfig);
