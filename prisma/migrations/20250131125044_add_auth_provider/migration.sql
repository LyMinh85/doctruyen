/*
  Warnings:

  - A unique constraint covering the columns `[auth_provider_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth_provider` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auth_provider_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "auth_provider" VARCHAR(50) NOT NULL,
ADD COLUMN     "auth_provider_id" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_auth_provider_id_key" ON "User"("auth_provider_id");
