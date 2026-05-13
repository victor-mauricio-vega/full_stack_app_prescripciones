/*
  Warnings:

  - The values [dispensed,cancelled] on the enum `PrescriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN,DOCTOR,PATIENT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `medication` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorUserId` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `PrescriptionItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PrescriptionStatus_new" AS ENUM ('pending', 'consumed');
ALTER TABLE "public"."Prescription" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Prescription" ALTER COLUMN "status" TYPE "PrescriptionStatus_new" USING ("status"::text::"PrescriptionStatus_new");
ALTER TYPE "PrescriptionStatus" RENAME TO "PrescriptionStatus_old";
ALTER TYPE "PrescriptionStatus_new" RENAME TO "PrescriptionStatus";
DROP TYPE "public"."PrescriptionStatus_old";
ALTER TABLE "Prescription" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin', 'doctor', 'patient');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "PrescriptionItem" DROP CONSTRAINT "PrescriptionItem_prescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_patientId_fkey";

-- DropIndex
DROP INDEX "Doctor_licenseNumber_key";

-- DropIndex
DROP INDEX "User_doctorId_key";

-- DropIndex
DROP INDEX "User_patientId_key";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "createdAt",
DROP COLUMN "licenseNumber",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "authorUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PrescriptionItem" DROP COLUMN "createdAt",
DROP COLUMN "frequency",
DROP COLUMN "medication",
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "quantity" INTEGER,
ALTER COLUMN "dosage" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "doctorId",
DROP COLUMN "patientId";

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");

-- CreateIndex
CREATE INDEX "Prescription_status_createdAt_idx" ON "Prescription"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");

-- CreateIndex
CREATE INDEX "Prescription_authorId_idx" ON "Prescription"("authorId");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
