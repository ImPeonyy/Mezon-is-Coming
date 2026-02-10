import { Module } from '@nestjs/common';
import { CommandService } from '../commands/command.service';

import { UsersModule } from '@/modules/users/users.module';
import { BuildingsModule } from '@/modules/buildings/buildings.module';
import { SpinsModule } from '@/modules/spins/spins.module';
import { VillagesModule } from '@/modules/villages/villages.module';
import { StatisticsModule } from '@/modules/statistics/statistics.module';

import { RegisCommand } from './regis/regis.command';
import { SpinCommand } from './spin/spin.command';
import { InviteCodeCommand } from './invite-code/invite-code.command';
@Module({
    imports: [UsersModule, VillagesModule, BuildingsModule, StatisticsModule, SpinsModule],
    providers: [CommandService, RegisCommand, SpinCommand, InviteCodeCommand],
    exports: [CommandService],
})
export class CommandModule {}
