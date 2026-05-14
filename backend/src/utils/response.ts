import { Response } from "express";
import { ApiResponse } from "../types";

// ── Success Response ──────────────────────────────────────────────────────────
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

// ── Error Response ────────────────────────────────────────────────────────────
export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: { field: string; message: string }[]
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
};

// ── Common HTTP Responses ─────────────────────────────────────────────────────
export const sendUnauthorized = (res: Response, message = "Unauthorized"): Response =>
  sendError(res, message, 401);

export const sendForbidden = (res: Response, message = "Access denied"): Response =>
  sendError(res, message, 403);

export const sendNotFound = (res: Response, message = "Resource not found"): Response =>
  sendError(res, message, 404);

export const sendServerError = (res: Response, message = "Internal server error"): Response =>
  sendError(res, message, 500);
