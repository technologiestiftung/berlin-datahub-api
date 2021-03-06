jest.setTimeout(10000);
process.env.APP_SECRET = "superdupersecret";
process.env.NODE_ENV = "test";
process.env.LOGDNA_KEY = "123";
const logger = {
  debug: jest.fn(),
  log: jest.fn(),
  add: jest.fn(),
};
jest.mock("logdna-winston");
jest.mock("winston", () => ({
  format: {
    colorize: jest.fn(),
    combine: jest.fn(),
    label: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    simple: jest.fn(),
  },
  createLogger: jest.fn().mockReturnValue(logger),
  transports: {
    Console: jest.fn(),
  },
}));
