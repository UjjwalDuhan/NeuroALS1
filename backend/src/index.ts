import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createServer } from "http";

import { env } from "./config/env";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import patientRoutes from "./routes/patientRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";
import { initChatWebSocketServer } from "./websocket/chatServer";

const app: Application = express();
app.set('trust proxy', 1);  // ← YE ADD KARO
connectDB();

connectDB();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many requests. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests from this IP. Please try again later." },
});

app.use(globalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "NeuroALS API is running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/patients", patientRoutes);   // ← NEW

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const server = createServer(app);
initChatWebSocketServer(server);

server.listen(env.PORT, () => {
  console.log(`\n🚀 NeuroALS API running in ${env.NODE_ENV} mode`);
  console.log(`📡 HTTP:  http://localhost:${env.PORT}`);
  console.log(`🔗 Health: http://localhost:${env.PORT}/health`);
  console.log(`💬 WebSocket: ws://localhost:${env.PORT}/ws/chat\n`);
});

process.on("unhandledRejection", (err: Error) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});

export default app;
