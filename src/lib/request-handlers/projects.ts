import { Project } from "@prisma/client";
import { HandlerFunction } from "../../common/types";
import { prisma } from "../prisma";
import { createPayload } from "../utils";
import createError from "http-errors";

export const getProjects: HandlerFunction = async (_request, response) => {
  const projects = await prisma.project.findMany({});
  response.json(createPayload({ projects }));
};

export const postProject: HandlerFunction = async (request, response) => {
  // console.log(request.body);
  // console.log("user", response.locals.user);
  const { title, ttnAppId, description, city } = request.body;
  const { userId } = response.locals.user as { userId: number };
  if (!title || typeof title !== "string") {
    throw createError(400, `title is not defined or not a string`);
  }
  if (!description || typeof description !== "string") {
    throw createError(400, `description is not defined or not a string`);
  }
  if (ttnAppId) {
    if (typeof ttnAppId !== "string") {
      throw createError(400, `ttnAppId is not a string`);
    }
  }
  if (city) {
    if (typeof city !== "string") {
      throw createError(400, `city is not a string`);
    }
  }
  const user = await prisma.user.findOne({ where: { id: userId } });
  let project: Project;
  if (user) {
    project = await prisma.project.create({
      data: {
        title,
        description,
        User: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  } else {
    throw createError(401, "How did you get here?");
  }

  response.status(201).json(createPayload({ project }));
};
