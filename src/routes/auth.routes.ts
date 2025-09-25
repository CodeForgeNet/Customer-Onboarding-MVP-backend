import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller";
import {
  validateRequest,
  registerValidationSchema,
  loginValidationSchema,
} from "../middlewares/validation.middleware";

const router = Router();

// POST /api/auth/register
router.post("/register", validateRequest(registerValidationSchema), register);

// POST /api/auth/login
router.post("/login", validateRequest(loginValidationSchema), login);

// POST /api/auth/logout
router.post("/logout", logout);

export default router;
