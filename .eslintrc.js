/* eslint-disable @typescript-eslint/no-var-requires */
const localConfig = {
  rules: {
    "jest/no-hooks": "off",
    "no-console": ["error", { allow: ["warn", "error"] }],
  },
};
const utlities = require("@inpyjamas/scripts/dist/utlities");
const config = require("@inpyjamas/scripts/eslint");
module.exports = utlities.merge(config, localConfig);
