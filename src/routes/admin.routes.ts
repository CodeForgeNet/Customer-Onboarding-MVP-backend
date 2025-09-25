import { Router } from "express";
import { getAllUsers } from "../controllers/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleGuard } from "../middlewares/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

// GET /api/admin/users
router.get("/users", authMiddleware, roleGuard([Role.ADMIN]), getAllUsers);

export default router;
