import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client"; // Import Role
import { handleServerError } from "../utils/errors";
import { AuthRequest } from "../types";

const prisma = new PrismaClient();

// ... (createCustomer and getAllCustomers functions remain the same)
export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, gstin, brokerId: requestedBrokerId } = req.body; // Extract requestedBrokerId
    let finalBrokerId = req.user?.id; // Default to authenticated user's ID

    // If authenticated user is ADMIN, allow them to specify brokerId
    if (req.user?.role === "ADMIN") {
      if (requestedBrokerId) {
        // Validate if the requestedBrokerId exists and is a BROKER
        const targetBroker = await prisma.user.findFirst({
          where: { id: requestedBrokerId, role: "BROKER" },
        });

        if (!targetBroker) {
          return res.status(400).json({ error: "Invalid brokerId provided" });
        }
        finalBrokerId = requestedBrokerId;
      } else {
        return res.status(400).json({ error: "brokerId is required for ADMIN to create customer" });
      }
    } else if (!finalBrokerId) { // If not ADMIN and no brokerId, then unauthorized
      return res.status(401).json({ error: "Unauthorized: Broker ID not found" });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        gstin,
        broker: {
          connect: { id: finalBrokerId },
        },
      },
    });

    return res.status(201).json(customer);
  } catch (error) {
    return handleServerError(res, error);
  }
};

export const getAllCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const brokerId = req.user?.id;

    if (!brokerId) {
      return res.status(401).json({ error: "Unauthorized: Broker ID not found" });
    }

    const customers = await prisma.customer.findMany({
      where: {
        brokerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(customers);
  } catch (error) {
    return handleServerError(res, error);
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, gstin } = req.body;
    const user = req.user;

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    // Check if customer exists and if the user is authorized to update it
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // An admin can update any customer, a broker can only update their own
    if (user?.role !== Role.ADMIN && customer.brokerId !== user?.id) {
      return res.status(404).json({ error: "Customer not found or not authorized" });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        gstin,
      },
    });

    return res.json(updatedCustomer);
  } catch (error) {
    return handleServerError(res, error);
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // An admin can delete any customer, a broker can only delete their own
    if (user?.role !== Role.ADMIN && customer.brokerId !== user?.id) {
      return res.status(404).json({ error: "Customer not found or not authorized" });
    }

    await prisma.customer.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    return handleServerError(res, error);
  }
};

export const getAllCustomersForAdmin = async (_req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.json(customers);
  } catch (error) {
    return handleServerError(res, error);
  }
};