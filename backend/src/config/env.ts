import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  NODE_ENV: string;
  CLIENT_URL: string;
  GEMINI_API_KEY: string;
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
}

const getEnvConfig = (): EnvConfig => {
  const required = ["MONGO_URI", "JWT_SECRET", "GEMINI_API_KEY", "EMAIL_USER", "EMAIL_PASS"];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`❌ Missing required environment variable: ${key}`);
    }
  }

  return {
    PORT: parseInt(process.env.PORT || "5000", 10),
    MONGO_URI: process.env.MONGO_URI as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    NODE_ENV: process.env.NODE_ENV || "development",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
    EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
    EMAIL_PORT: process.env.EMAIL_PORT || "587",
    EMAIL_USER: process.env.EMAIL_USER as string,
    EMAIL_PASS: process.env.EMAIL_PASS as string,
  };
};

export const env = getEnvConfig();
