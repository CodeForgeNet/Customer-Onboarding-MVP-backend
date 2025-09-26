import { Request, Response } from "express";
import { PrismaClient, Prisma, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { handleServerError } from "../utils/errors";

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

export const getAdminDashboard = async (_req: Request, res: Response) => {
  try {
    const totalCustomers = await prisma.customer.count();
    const totalBrokers = await prisma.user.count({ where: { role: Role.BROKER } });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const newCustomersThisMonth = await prisma.customer.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const newBrokersThisMonth = await prisma.user.count({
        where: {
            role: Role.BROKER,
            createdAt: {
                gte: startOfMonth,
                lte: endOfMonth,
            },
        },
    });

    res.json({
      totalCustomers,
      totalBrokers,
      newlyAddedThisMonth: newCustomersThisMonth + newBrokersThisMonth,
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const brokers = await prisma.user.findMany({
      where: {
        role: Role.BROKER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        gstin: true,
        role: true,
        createdAt: true,
      },
    });

    const customers = await prisma.customer.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            gstin: true,
            createdAt: true,
        },
    });

    const users = [
        ...brokers,
        ...customers.map(c => ({ ...c, role: 'CUSTOMER' as const })),
    ];

    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json(users);
  } catch (error) {
    return handleServerError(res, error);
  }
};

export const createBroker = async (req: Request, res: Response) => {
  try {
    const { name, email, password, gstin } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user with BROKER role
    const broker = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gstin,
        role: "BROKER", // Explicitly set role to BROKER
      },
    });

    return res.status(201).json({
      message: "Broker registered successfully",
      broker: { id: broker.id, name: broker.name, email: broker.email, gstin: broker.gstin, role: broker.role },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: "Email or GSTIN already registered" });
      }
    }
    return handleServerError(res, error);
  }
};

export const getAllBrokers = async (_req: Request, res: Response) => {
  try {
    const brokers = await prisma.user.findMany({
      where: {
        role: "BROKER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        gstin: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json(brokers);
  } catch (error) {
    return handleServerError(res, error);
  }
};

export const updateBroker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, gstin } = req.body;

    const broker = await prisma.user.findUnique({
      where: { id },
    });

    if (!broker || broker.role !== Role.BROKER) {
      return res.status(404).json({ error: "Broker not found" });
    }

    const updatedBroker = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        gstin,
      },
    });

    return res.json(updatedBroker);
  } catch (error) {
    return handleServerError(res, error);
  }
};

export const deleteBroker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const broker = await prisma.user.findUnique({
      where: { id },
    });

    if (!broker || broker.role !== Role.BROKER) {
      return res.status(404).json({ error: "Broker not found" });
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    return handleServerError(res, error);
  }
};
