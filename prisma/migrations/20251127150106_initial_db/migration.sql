-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "coin" INTEGER NOT NULL DEFAULT 0,
    "mezon_token" INTEGER NOT NULL DEFAULT 0,
    "invite_link" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/do2rk0jz8/image/upload/v1757571181/download_ygjzey.jpg',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spin" (
    "id" TEXT NOT NULL,
    "spin_balance" INTEGER NOT NULL DEFAULT 50,
    "spin_limit" INTEGER NOT NULL DEFAULT 50,
    "spin_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Spin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_invite_link_key" ON "User"("invite_link");
