/*
  Warnings:

  - Made the column `logo` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "logo" SET NOT NULL;
