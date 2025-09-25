"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post("/register", (0, validation_middleware_1.validateRequest)(validation_middleware_1.registerValidationSchema), auth_controller_1.register);
// POST /api/auth/login
router.post("/login", (0, validation_middleware_1.validateRequest)(validation_middleware_1.loginValidationSchema), auth_controller_1.login);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map