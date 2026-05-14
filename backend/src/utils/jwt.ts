import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload, UserRole } from "../types";

// ── Generate Access Token ─────────────────────────────────────────────────────
export const generateToken = (
  userId: string,
  email: string,
  role: UserRole
): string => {
  const payload: JwtPayload = { userId, email, role };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    issuer: "neuroals-api",
    audience: "neuroals-client",
  });
};

// ── Verify Token ──────────────────────────────────────────────────────────────
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: "neuroals-api",
      audience: "neuroals-client",
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired. Please login again.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token. Please login again.");
    }
    throw new Error("Token verification failed.");
  }
};

// ── Decode Without Verification (for debugging only) ─────────────────────────
export const decodeToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null;
};
