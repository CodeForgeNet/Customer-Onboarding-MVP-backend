"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
const getProfile = async (req, res) => {
    try {
        // req.user is set by the auth middleware
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Fetch fresh user data (optional, can also just return req.user if it's complete)
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                gstin: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json(user);
    }
    catch (error) {
        return (0, errors_1.handleServerError)(res, error);
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=user.controller.js.map