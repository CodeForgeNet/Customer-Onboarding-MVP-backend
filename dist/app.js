"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express_1.default.json());
// Routes
app.get("/", (req, res) => {
    res.send("Customer Onboarding API");
});
// API routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api", user_routes_1.default); // For the /api/me endpoint
// Error handling for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map