import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { handleServerError } from "../utils/errors";

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email already in use",
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        // role defaults to BROKER as defined in the schema
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // passwordHash is deliberately excluded
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return handleServerError(res, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user not found or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const signOptions: jwt.SignOptions = {
      expiresIn: 604800,
    };
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, signOptions);

    // Return token and user profile (excluding passwordHash)
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      token,
      user: userProfile,
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};
