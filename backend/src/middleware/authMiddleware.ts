import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { sendUnauthorized, sendForbidden } from "../utils/response";
import { AuthRequest, UserRole } from "../types";

// ── Protect Route: Verify JWT ─────────────────────────────────────────────────
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendUnauthorized(res, "No token provided. Please login.");
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      sendUnauthorized(res, "Malformed authorization header.");
      return;
    }

    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    const err = error as Error;
    sendUnauthorized(res, err.message);
  }
};

// ── Role-Based Access Control ─────────────────────────────────────────────────
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, "Not authenticated.");
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendForbidden(
        res,
        `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}`
      );
      return;
    }

    next();
  };
};
