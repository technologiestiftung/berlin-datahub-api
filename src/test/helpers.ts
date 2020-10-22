/* eslint-disable jest/no-hooks */
/* eslint-disable jest/require-top-level-describe */
import e from "express";

import { prisma } from "../lib/prisma";
type TableNames = "Device" | "Project" | "Record" | "User";
export async function cleanUpDB(tables: TableNames[]): Promise<void> {
  for (const table of tables) {
    try {
      await prisma.$executeRaw(`DELETE FROM ${table}`);
    } catch (error) {
      console.error(error);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setupRequest(overrides?: { [key: string]: any }): e.Request {
  const req = { ...overrides } as e.Request;

  return req;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setupResponse(overrides?: { [key: string]: any }): e.Response {
  const res = ({
    status: jest.fn(() => res),
    json: jest.fn(() => res),
    ...overrides,
  } as unknown) as e.Response;
  return res;
}
