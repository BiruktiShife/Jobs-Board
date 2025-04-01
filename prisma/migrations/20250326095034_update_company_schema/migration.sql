-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'COMPANY_ADMIN';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "about" TEXT,
ADD COLUMN     "logo" TEXT;
