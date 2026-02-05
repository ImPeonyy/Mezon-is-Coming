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
}
