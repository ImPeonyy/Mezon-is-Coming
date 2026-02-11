import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Prisma, Statistic } from '@generated/prisma/client';

@Injectable()
export class StatisticsService {
    constructor(private readonly prisma: PrismaService) {}

    async initStatistic(prisma: Prisma.TransactionClient, userId: number): Promise<Statistic> {
        return await prisma.statistic.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }

    async getStatistic(prisma: Prisma.TransactionClient, where: Prisma.StatisticWhereUniqueInput): Promise<Statistic> {
        return await prisma.statistic.findUnique({ where });
    }

    async updateStatistic(prisma: Prisma.TransactionClient, where: Prisma.StatisticWhereUniqueInput, data: Prisma.StatisticUpdateInput) {
        return await prisma.statistic.update({ where, data });
    }
}
