import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { handleServerError } from "../utils/errors";

const prisma = new PrismaClient();

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
