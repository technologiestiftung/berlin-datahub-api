import { prisma } from "./prisma";

describe("device handlers", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });
  afterEach(async () => {
    await prisma.$executeRaw("DELETE from 'Device'");
    await prisma.$executeRaw("DELETE from 'Project'");
    await prisma.$executeRaw("DELETE from 'Record'");
  });
  test.todo("write some tests here");
});
