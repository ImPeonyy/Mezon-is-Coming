import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Prisma, Village } from '@generated/prisma/client';

@Injectable()
export class VillagesService {
    constructor(private readonly prisma: PrismaService) {}

    async initVillage(prisma: Prisma.TransactionClient, userId: number): Promise<Village> {
        return await prisma.village.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }

    async updateVillage(
        prisma: Prisma.TransactionClient,
        where: Prisma.VillageWhereUniqueInput,
        data: Prisma.VillageUpdateInput,
    ): Promise<Village> {
        return await prisma.village.update({
            where,
            data,
        });
    }
}
