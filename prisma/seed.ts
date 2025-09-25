import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 12;
  const adminPassword = await bcrypt.hash("admin123", saltRounds);
  const brokerPassword = await bcrypt.hash("broker123", saltRounds);

  // Create admin user
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create broker user
  await prisma.user.create({
    data: {
      name: "Acme Export",
      email: "broker@acme.com",
      password: brokerPassword,
      role: Role.BROKER,
    },
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });