import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { handleServerError } from "../utils/errors";

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        customers: {
          select: {
            gstin: true,
          },
        },
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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
