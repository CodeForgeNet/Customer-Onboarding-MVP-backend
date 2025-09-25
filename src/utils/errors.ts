import { Response } from "express";

export const handleServerError = (res: Response, error: any) => {
  console.error("Server error:", error);
  return res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};
