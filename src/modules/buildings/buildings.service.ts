import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Prisma, BuildingType } from '@generated/prisma/client';

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
}
