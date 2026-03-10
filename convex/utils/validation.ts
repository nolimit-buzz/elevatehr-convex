import Bcryptjs from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { Infer } from "convex/values";
import { UserSchema } from "../modules/user";
import { UserPayload } from "./types";

export const hashPassword = (password: string) => {
  return Bcryptjs.hashSync(password, 10);
};

export const verifyPassword = (args: { password: string; hashedPassword: string }) => {
  return Bcryptjs.compareSync(args.password, args.hashedPassword);
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
