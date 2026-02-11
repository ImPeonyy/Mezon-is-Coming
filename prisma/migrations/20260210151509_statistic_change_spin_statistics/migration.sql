/*
  Warnings:

  - You are about to drop the column `spin_win_count` on the `Spin` table. All the data in the column will be lost.
  - You are about to drop the column `total_coin_from_spin` on the `Spin` table. All the data in the column will be lost.
  - You are about to drop the column `total_spined` on the `Spin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Spin" DROP COLUMN "spin_win_count",
DROP COLUMN "total_coin_from_spin",
DROP COLUMN "total_spined";

-- AlterTable
ALTER TABLE "Statistic" ADD COLUMN     "spin_win_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_coin_from_spin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_spined" INTEGER NOT NULL DEFAULT 0;
