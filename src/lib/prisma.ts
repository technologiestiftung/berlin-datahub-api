import { PrismaClient } from "@prisma/client";
/**
 * We have one prisma client we use throughout the application.
 * NOt sure if this makes a difference.
 * It would allow us to use some special configruation on prisma
 *
 */
export const prisma = new PrismaClient();
