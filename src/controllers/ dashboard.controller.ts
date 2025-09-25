import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types";
import { handleServerError } from "../utils/errors";

const prisma = new PrismaClient();

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get total client count
    const clientsCount = await prisma.user.count({
      where: {
        role: "BROKER",
      },
    });

    // Get recent signups (last 5 brokers)
    const recentSignups = await prisma.user.findMany({
      where: {
        role: "BROKER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Sample dashboard data
    const dashboardData = {
      clientsCount,
      recent: recentSignups,
    };

    return res.json(dashboardData);
  } catch (error) {
    return handleServerError(res, error);
  }
};
