import { Router } from "express";
import { getProfile, getUserById } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// GET /api/me
router.get("/me", authMiddleware, getProfile);

// GET /api/users/:id
router.get("/users/:id", authMiddleware, getUserById);

export default router;
