import { PrismaClient } from "@prisma/client";
// const testOpts = {
//   datasources: {
//     db: {
//       url: "file:./dev_qa.db",
//     },
//   },
// };
export const prisma = new PrismaClient();
// process.env.NODE_ENV === "test" ? testOpts : undefined,
