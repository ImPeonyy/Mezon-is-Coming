-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('TOWER', 'FARM', 'PET_STATUE', 'STATUE', 'VEHICLE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "mezon_id" TEXT NOT NULL,
    "coin" INTEGER NOT NULL DEFAULT 0,
    "mezon_token_balance" INTEGER NOT NULL DEFAULT 0,
    "total_mezon_token" INTEGER NOT NULL DEFAULT 0,
    "invite_link" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/do2rk0jz8/image/upload/v1757571181/download_ygjzey.jpg',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spin" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "spin_balance" INTEGER NOT NULL DEFAULT 50,
    "spin_limit" INTEGER NOT NULL DEFAULT 50,
    "total_spined" INTEGER NOT NULL DEFAULT 0,
    "spin_win_count" INTEGER NOT NULL DEFAULT 0,
    "total_coin_from_spin" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Spin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "shield" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Building" (
    "id" SERIAL NOT NULL,
    "village_id" INTEGER NOT NULL,
    "type" "BuildingType" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "max_level" INTEGER NOT NULL DEFAULT 5,
    "is_distroyed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistic" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "attack_count" INTEGER NOT NULL DEFAULT 0,
    "attacked_count" INTEGER NOT NULL DEFAULT 0,
    "attack_success_count" INTEGER NOT NULL DEFAULT 0,
    "shield_break_count" INTEGER NOT NULL DEFAULT 0,
    "shield_blocked_count" INTEGER NOT NULL DEFAULT 0,
    "raid_count" INTEGER NOT NULL DEFAULT 0,
    "raided_count" INTEGER NOT NULL DEFAULT 0,
    "perfect_raid_count" INTEGER NOT NULL DEFAULT 0,
    "total_coin_from_raid" INTEGER NOT NULL DEFAULT 0,
    "best_raid" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_mezon_id_key" ON "User"("mezon_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_invite_link_key" ON "User"("invite_link");

-- CreateIndex
CREATE UNIQUE INDEX "Spin_user_id_key" ON "Spin"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Village_user_id_key" ON "Village"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Building_village_id_type_key" ON "Building"("village_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Statistic_user_id_key" ON "Statistic"("user_id");

-- AddForeignKey
ALTER TABLE "Spin" ADD CONSTRAINT "Spin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statistic" ADD CONSTRAINT "Statistic_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
