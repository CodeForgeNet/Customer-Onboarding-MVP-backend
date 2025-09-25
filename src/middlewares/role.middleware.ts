import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "../types";

export const roleGuard = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!roles.includes(req.user.role as Role)) {
      return res
        .status(403)
        .json({ error: "Forbidden: Insufficient privileges" });
    }

    next();
  };
};
