import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Prisma, PrismaClient, Spin } from '@generated/prisma/client';

@Injectable()
export class SpinsService {
    constructor(private readonly prisma: PrismaService) {}

    async initSpin(prisma: Prisma.TransactionClient, userId: number, spinBalance: number): Promise<Spin> {
        return await prisma.spin.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                spin_balance: spinBalance,
            },
        });
    }

    async updateSpin(
        prisma: PrismaClient | Prisma.TransactionClient,
        where: Prisma.SpinWhereUniqueInput,
        data: Prisma.SpinUpdateInput,
    ): Promise<Spin> {
        return await prisma.spin.update({
            where,
            data,
        });
    }
}
