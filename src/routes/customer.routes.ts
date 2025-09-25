import { Router } from "express";
import {
  createCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
  getAllCustomersForAdmin,
} from "../controllers/customer.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleGuard } from "../middlewares/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

// POST /api/customers - Create a new customer
router.post("/customers", authMiddleware, createCustomer);

// GET /api/customers - Get all customers for the logged-in broker
router.get("/customers", authMiddleware, getAllCustomers);

// GET /api/admin/customers - Get all customers (Admin only)
router.get("/admin/customers", authMiddleware, roleGuard([Role.ADMIN]), getAllCustomersForAdmin);

// PUT /api/customers/:id - Update a customer
router.put("/customers/:id", authMiddleware, updateCustomer);

// DELETE /api/customers/:id - Delete a customer
router.delete("/customers/:id", authMiddleware, deleteCustomer);

export default router;
