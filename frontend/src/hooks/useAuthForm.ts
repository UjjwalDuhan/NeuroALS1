import { useState } from "react";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types";

interface UseAuthFormReturn {
  isLoading: boolean;
  serverError: string;
  fieldErrors: Record<string, string>;
  setServerError: (msg: string) => void;
  clearErrors: () => void;
  handleApiError: (error: unknown) => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T | undefined>;
}

// ── Generic hook for auth form error handling ─────────────────────────────────
export const useAuthForm = (): UseAuthFormReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = () => {
    setServerError("");
    setFieldErrors({});
  };

  const handleApiError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiResponse | undefined;

      if (data?.errors && Array.isArray(data.errors)) {
        // Field-level validation errors from server
        const mapped: Record<string, string> = {};
        data.errors.forEach(({ field, message }) => {
          mapped[field] = message;
        });
        setFieldErrors(mapped);
        setServerError(""); // Don't show banner if we have field errors
      } else if (data?.message) {
        setServerError(data.message);
      } else if (error.code === "ERR_NETWORK") {
        setServerError("Cannot connect to server. Please check your connection.");
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } else {
      setServerError("An unexpected error occurred.");
    }
  };

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    setIsLoading(true);
    clearErrors();
    try {
      return await fn();
    } catch (err) {
      handleApiError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    serverError,
    fieldErrors,
    setServerError,
    clearErrors,
    handleApiError,
    withLoading,
  };
};
