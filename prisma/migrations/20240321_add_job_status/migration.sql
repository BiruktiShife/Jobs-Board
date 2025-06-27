-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "status" "JobStatus" NOT NULL DEFAULT 'PENDING'; 