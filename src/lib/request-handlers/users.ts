import { compare, hash } from "bcrypt";
import { sign, SignOptions } from "jsonwebtoken";
import { HandlerFunction } from "../../common/types";
import { APP_SECRET } from "../envs";
import { prisma } from "../prisma";
import { createPayload } from "../utils";
import createError from "http-errors";
const tokenSignOpts: SignOptions = {
  algorithm: "HS256",
  // expiresIn: "7d",
};

/**
 * This is for signing up users. It actually is disabled in production.
 * Users can only created by developers for now
 * re DATAHUB-82
 * TODO: [DATAHUB-89] Find a better schema for backend user authentication. This is actually a frontend method that we are using. The JWTs should not live forever
 */
export const signup: HandlerFunction = async (request, response) => {
  const { username, password } = request.body;

  if (!username && typeof username !== "string") {
    throw createError(400, "username not provided or not a string");
  }
  if (!password && typeof password !== "string") {
    throw createError(400, "password not provided or not a string");
  }
  const hashedPassword = await hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hashedPassword },
  });

  const token = sign({ userId: user.id }, APP_SECRET, tokenSignOpts);
  response
    .status(201)
    .json(
      createPayload({ user: { id: user.id, username: user.username }, token }),
    );
};

/**
 * handles user login and returns token if user and password match
 */
export const login: HandlerFunction = async (request, response) => {
  const { username, password } = request.body;
  console.log(request.body);
  if (!username && typeof username !== "string") {
    throw createError(400, "username not provided or not a string");
  }
  if (!password && typeof password !== "string") {
    throw createError(400, "password not provided or not a string");
  }
  const user = await prisma.user.findOne({
    where: {
      username,
    },
  });
  if (!user) {
    throw createError(401, `No user found for email: ${username}`);
  }
  const passwordValid = await compare(password, user.password);
  if (!passwordValid) {
    throw createError(401, `invalid password`);
  }
  const token = sign({ userId: user.id }, APP_SECRET, tokenSignOpts);

  response
    .status(201)
    .json(
      createPayload({ user: { id: user.id, username: user.username }, token }),
    );
};

/**
 * Returns some basic information about a user
 *
 */
export const profile: HandlerFunction = async (request, response) => {
  const { userId } = response.locals.user;
  const user = await prisma.user.findOne({ where: { id: userId } });
  if (!user) {
    throw createError(401, "not authorized");
  }
  response
    .status(200)
    .json(createPayload({ user: { username: user.username, id: user.id } }));
};
