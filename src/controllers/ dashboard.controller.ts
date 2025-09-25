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

    const brokerId = req.user.id;

    // Get total client count
    const clientsCount = await prisma.customer.count({
      where: {
        brokerId,
      },
    });

    // Get recent signups (last 5 customers)
    const recentSignups = await prisma.customer.findMany({
      where: {
        brokerId,
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

    // Get new customers this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const newCustomersThisMonth = await prisma.customer.count({
      where: {
        brokerId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Sample dashboard data
    const dashboardData = {
      clientsCount,
      recent: recentSignups,
      newCustomersThisMonth,
    };

    return res.json(dashboardData);
  } catch (error) {
    return handleServerError(res, error);
  }
};
