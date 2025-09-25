import { Router } from "express";
import { getAllUsers, createBroker, getAllBrokers } from "../controllers/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleGuard } from "../middlewares/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

// GET /api/admin/users
router.get("/users", authMiddleware, roleGuard([Role.ADMIN]), getAllUsers);

// POST /api/admin/brokers - Create a new broker (Admin only)
router.post("/brokers", authMiddleware, roleGuard([Role.ADMIN]), createBroker);

// GET /api/admin/brokers - Get all brokers (Admin only)
router.get("/brokers", authMiddleware, roleGuard([Role.ADMIN]), getAllBrokers);

export default router;
