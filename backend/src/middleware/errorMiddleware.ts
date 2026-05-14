import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

interface AppError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  path?: string;
  value?: unknown;
}

// ── Not Found Handler ─────────────────────────────────────────────────────────
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error: AppError = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// ── Global Error Handler ──────────────────────────────────────────────────────
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose Duplicate Key Error (email already exists)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a different one.`;
  }

  // Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    const validationErrors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    res.status(statusCode).json({
      success: false,
      message: "Validation failed",
      errors: validationErrors,
    });
    return;
  }

  // Mongoose Cast Error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please login again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please login again.";
  }

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.error("🔥 Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
