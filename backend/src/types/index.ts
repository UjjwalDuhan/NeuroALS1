import { Request } from "express";
import { Document, Types } from "mongoose";

// ── User Role Enum ───────────────────────────────────────────────────────────
export enum UserRole {
  DOCTOR = "doctor",
  RESEARCHER = "researcher",
  ADMIN = "admin",
}

// ── Mongoose User Document ────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  institution?: string;
  specialty?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

// ── JWT Payload ───────────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ── Authenticated Request (extends Express Request) ──────────────────────────
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

// ── API Response Shapes ───────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// ── Auth DTOs ─────────────────────────────────────────────────────────────────
export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  institution?: string;
  specialty?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  role: UserRole;
}

// ── Public User (without password) ───────────────────────────────────────────
export interface PublicUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  institution?: string;
  specialty?: string;
  isVerified: boolean;
  createdAt: Date;
}
