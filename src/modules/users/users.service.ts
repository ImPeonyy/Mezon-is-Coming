import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/lib/prisma/prisma.service";
import { Prisma } from "@generated/prisma/client";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async getUser(userId: string) {
        return await this.prisma.user.findUnique({
            where: { id: Number(userId) },
        });
    }

    async createUser(user: Prisma.UserCreateInput) {
        return await this.prisma.user.create({
            data: user,
        });
    }

    async updateUser(userId: string, user: Prisma.UserUpdateInput) {
        return await this.prisma.user.update({
            where: { id: Number(userId) },
            data: user,
        });
    }

    async deleteUser(userId: string) {
        return await this.prisma.user.delete({
            where: { id: Number(userId) },
        });
    }
}