import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Prisma, BuildingType, Building, PrismaClient } from '@generated/prisma/client';

@Injectable()
export class BuildingsService {
    constructor(private readonly prisma: PrismaService) {}

    async initBuilding(prisma: Prisma.TransactionClient, villageId: number): Promise<void> {
        await prisma.building.createMany({
            data: [
                {
                    village_id: villageId,
                    type: BuildingType.TOWER,
                },
                {
                    village_id: villageId,
                    type: BuildingType.FARM,
                },
                {
                    village_id: villageId,
                    type: BuildingType.PET_STATUE,
                },
                {
                    village_id: villageId,
                    type: BuildingType.STATUE,
                },
                {
                    village_id: villageId,
                    type: BuildingType.VEHICLE,
                },
            ],
        });
    }

    async updateBuilding(
        prisma: PrismaClient | Prisma.TransactionClient,
        where: Prisma.BuildingWhereUniqueInput,
        data: Prisma.BuildingUpdateInput,
    ): Promise<Building> {
        return await prisma.building.update({ where, data });
    }

    async downgradeBuilding(prisma: Prisma.TransactionClient, villageId: number, type: BuildingType) {
        // 1️⃣ get trước
        const building = await prisma.building.findUnique({
            where: {
                village_id_type: {
                    village_id: villageId,
                    type,
                },
            },
            select: {
                id: true,
                level: true,
            },
        });

        // ❌ không tồn tại hoặc level = 1 → bỏ qua
        if (!building || building.level <= 1) {
            return null;
        }

        // 2️⃣ update
        return await prisma.building.update({
            where: {
                id: building.id,
            },
            data: {
                level: { decrement: 1 },
            },
        });
    }
}
