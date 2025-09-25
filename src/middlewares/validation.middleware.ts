import { Request, Response, NextFunction } from "express";

interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { [key: string]: string } = {};

    for (const field in schema) {
      const rules = schema[field];
      const value = req.body[field];

      // Check required
      if (rules.required && (value === undefined || value === "")) {
        errors[field] = rules.message || `${field} is required`;
        continue;
      }

      // Skip other validations if field is not present and not required
      if (value === undefined || value === null || value === "") {
        continue;
      }

      // Check type
      if (rules.type && typeof value !== rules.type) {
        errors[field] = rules.message || `${field} must be a ${rules.type}`;
        continue;
      }

      // Check minLength (for strings)
      if (
        rules.minLength !== undefined &&
        typeof value === "string" &&
        value.length < rules.minLength
      ) {
        errors[field] =
          rules.message ||
          `${field} must be at least ${rules.minLength} characters`;
        continue;
      }

      // Check maxLength (for strings)
      if (
        rules.maxLength !== undefined &&
        typeof value === "string" &&
        value.length > rules.maxLength
      ) {
        errors[field] =
          rules.message ||
          `${field} must be no more than ${rules.maxLength} characters`;
        continue;
      }

      // Check pattern
      if (
        rules.pattern &&
        typeof value === "string" &&
        !rules.pattern.test(value)
      ) {
        errors[field] = rules.message || `${field} has an invalid format`;
        continue;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
};

// Validation schema for user registration
export const registerValidationSchema = {
  name: {
    required: true,
    type: "string",
    message: "Name is required",
  },
  email: {
    required: true,
    type: "string",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Valid email is required",
  },
  gstin: {
    required: true,
    type: "string",
    message: "GSTIN is required",
  },
  password: {
    required: true,
    type: "string",
    minLength: 8,
    message: "Password must be at least 8 characters long",
  },
};

// Validation schema for login
export const loginValidationSchema = {
  email: {
    required: true,
    type: "string",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Valid email is required",
  },
  password: {
    required: true,
    type: "string",
    message: "Password is required",
  },
};
