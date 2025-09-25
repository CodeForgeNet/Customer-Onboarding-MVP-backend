import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
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

export default router;
