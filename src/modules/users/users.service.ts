import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Prisma, User, Spin, Village, PrismaClient } from '@generated/prisma/client';
import { generateInviteCode } from '@/utils';
import { DEFAULT_AVATAR } from '@/constants';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async initUser(
        prisma: Prisma.TransactionClient,
        mezonId: string,
        username: string,
        avatar: string,
        coin: number,
    ): Promise<User> {
        return await prisma.user.create({
            data: {
                username: username,
                mezon_id: mezonId,
                coin: coin,
                invite_code: generateInviteCode(username),
                avatar: avatar,
            },
        });
    }

    async initBot(mezonBotId: string): Promise<User> {
        try {
            return await this.prisma.user.create({
                data: {
                    username: 'MIC Bot',
                    mezon_id: mezonBotId,
                    invite_code: generateInviteCode('MIC_BOT'),
                    avatar: DEFAULT_AVATAR,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                return this.prisma.user.findUnique({
                    where: { mezon_id: mezonBotId },
                }) as Promise<User>;
            }
        }
    }

    async getUser(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where,
        });
    }

    async updateUser(
        prisma: PrismaClient | Prisma.TransactionClient,
        where: Prisma.UserWhereUniqueInput,
        data: Prisma.UserUpdateInput,
    ): Promise<User> {
        return await prisma.user.update({
            where,
            data: data,
        });
    }

    async upsertUser(
        prisma: Prisma.TransactionClient,
        where: Prisma.UserWhereUniqueInput,
        updateData: Prisma.UserUpdateInput,
        createData: Prisma.UserCreateInput,
    ): Promise<User> {
        return await prisma.user.upsert({
            where,
            update: updateData,
            create: createData,
        });
    }

    async getEntryUser(where: Prisma.UserWhereUniqueInput): Promise<(User & { spin: Spin; village: Village }) | null> {
        return await this.prisma.user.findUnique({
            where,
            include: {
                spin: true,
                village: true,
            },
        });
    }

    async getUserwithSpin(where: Prisma.UserWhereUniqueInput): Promise<User & { spin: Spin | null }> {
        const userWithSpin = await this.prisma.user.findUnique({
            where,
            include: {
                spin: true,
            },
        });

        if (!userWithSpin) {
            return null;
        }

        return userWithSpin;
    }
}
