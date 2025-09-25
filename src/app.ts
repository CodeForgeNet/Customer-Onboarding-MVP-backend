import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import adminRoutes from "./routes/admin.routes";

// Import middleware
import {
  globalLimiter,
  authLimiter,
} from "./middlewares/rate-limiter.middleware";

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet()); // Set various HTTP headers for security

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10kb" })); // Body parsing with size limit
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Apply rate limiting
app.use(globalLimiter); // Global rate limiting
app.use("/api/auth", authLimiter); // Stricter limits on auth routes

// Routes
app.get("/", (req, res) => {
  res.send("Customer Onboarding API");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/admin", adminRoutes);

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

// Start server only if not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
