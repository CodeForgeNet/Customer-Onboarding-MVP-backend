import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { sanitize } from "../utils/sanitize";

// Common validation rules
export const userValidationRules = {
  register: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .customSanitizer(sanitize),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),

    body("gstin")
      .trim()
      .notEmpty()
      .withMessage("GSTIN is required")
      .customSanitizer(sanitize),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number"),
  ],

  login: [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),

    body("password").notEmpty().withMessage("Password is required"),
  ],
};

// Middleware to handle validation errors
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
