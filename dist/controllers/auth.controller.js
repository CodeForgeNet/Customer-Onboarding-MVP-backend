"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const register = async (req, res) => {
    try {
        const { name, email, gstin, password } = req.body;
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
        const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Create the user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                gstin,
                password: passwordHash,
                // role defaults to BROKER as defined in the schema
            },
            select: {
                id: true,
                name: true,
                email: true,
                gstin: true,
                role: true,
                // passwordHash is deliberately excluded
            },
        });
        return res.status(201).json(newUser);
    }
    catch (error) {
        return (0, errors_1.handleServerError)(res, error);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });
        // If user not found or password doesn't match
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }
        // Generate JWT token
        const signOptions = {
            expiresIn: 604800,
        };
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, signOptions);
        // Return token and user profile (excluding passwordHash)
        const userProfile = {
            id: user.id,
            name: user.name,
            email: user.email,
            gstin: user.gstin,
            role: user.role,
        };
        return res.status(200).json({
            token,
            user: userProfile,
        });
    }
    catch (error) {
        return (0, errors_1.handleServerError)(res, error);
    }
};
exports.login = login;
//# sourceMappingURL=auth.controller.js.map