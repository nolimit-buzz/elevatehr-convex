import Bcryptjs from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { Infer } from "convex/values";
import { UserSchema } from "../modules/user";
import { UserPayload } from "./types";

export const hashPassword = async (password: string) => {
  return await Bcryptjs.hash(password, 10);
};

export const verifyPassword = async (args: { password: string; hashedPassword: string }) => {
  return await Bcryptjs.compare(args.password, args.hashedPassword);
};

export const generateToken = async (userPayload: UserPayload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const token = await new SignJWT(userPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("20d")
    .sign(secret);

  return token;
};

export const verifyToken = async (token: string) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as UserPayload;
  } catch (error) {
    return null;
  }
};
