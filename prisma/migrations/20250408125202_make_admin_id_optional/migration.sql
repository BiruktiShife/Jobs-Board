-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_adminId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "status" TEXT DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "adminId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
