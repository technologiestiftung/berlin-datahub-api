module.exports = {
  inputFiles: ["./src"],
  mode: "modules",
  out: "docs",
  exclude: ["**/*+(test|.spec|.e2e).ts", "test/helpers"],
  // theme: "minimal",
  includeVersion: true,
};
