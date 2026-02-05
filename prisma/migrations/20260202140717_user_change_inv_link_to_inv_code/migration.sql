/*
  Warnings:

  - You are about to drop the column `invite_link` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invite_code]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invite_code` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_invite_link_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "invite_link",
ADD COLUMN     "invite_code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_invite_code_key" ON "User"("invite_code");
