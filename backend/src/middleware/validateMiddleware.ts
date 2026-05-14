import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";

// ── Run validators and collect errors ────────────────────────────────────────
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations in parallel
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      next();
      return;
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.type === "field" ? err.path : "unknown",
      message: err.msg,
    }));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  };
};
