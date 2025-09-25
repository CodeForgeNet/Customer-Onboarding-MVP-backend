"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleServerError = void 0;
const handleServerError = (res, error) => {
    console.error("Server error:", error);
    return res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
};
exports.handleServerError = handleServerError;
//# sourceMappingURL=errors.js.map