import request from "supertest";
import app from "../app";
import { PrismaClient } from "@prisma/client";

// Mock environment variables
process.env.JWT_SECRET = "test-secret";
process.env.BCRYPT_SALT_ROUNDS = "12";

const prisma = new PrismaClient();

// Clean up function to be used after tests
const cleanupDatabase = async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "test-",
      },
    },
  });
};

describe("Authentication API", () => {
  beforeAll(async () => {
    // Clean database before tests
    await cleanupDatabase();
  });

  afterAll(async () => {
    // Clean up after tests
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  // Test user registration
  it("should register a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test-user@example.com",
      gstin: "09TESTG1234H1Z5",
      password: "TestPassword123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("email", "test-user@example.com");
    expect(response.body).toHaveProperty("role", "BROKER");
    expect(response.body).not.toHaveProperty("passwordHash");
  });

  // Test user registration validation
  it("should validate registration input", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "invalid-email",
      gstin: "09TESTG1234H1Z5",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  // Test login
  it("should login registered user and return JWT token", async () => {
    // First register a user
    await request(app).post("/api/auth/register").send({
      name: "Test Login User",
      email: "test-login@example.com",
      gstin: "09TESTL1234H1Z5",
      password: "TestPassword123",
    });

    // Then login with that user
    const response = await request(app).post("/api/auth/login").send({
      email: "test-login@example.com",
      password: "TestPassword123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty(
      "email",
      "test-login@example.com"
    );
    expect(response.body.user).not.toHaveProperty("passwordHash");
  });

  // Test protected route
  it("should access protected route with valid JWT", async () => {
    // Login to get token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test-login@example.com",
      password: "TestPassword123",
    });

    const token = loginResponse.body.token;

    // Access protected route
    const response = await request(app)
      .get("/api/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("email", "test-login@example.com");
  });

  // Test invalid JWT
  it("should reject invalid JWT token", async () => {
    const response = await request(app)
      .get("/api/me")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
  });
});
