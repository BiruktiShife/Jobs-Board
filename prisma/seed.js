/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("shif724720", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "biruktawitshiferaw@gmail.com" },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: "Admin Biruktawit",
      email: "biruktawitshiferaw@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("Admin user created:", adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
