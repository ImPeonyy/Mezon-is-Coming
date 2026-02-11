import { Module } from '@nestjs/common';
import { SpinsService } from './spins.service';

@Module({
    providers: [SpinsService],
    exports: [SpinsService],
})
export class SpinsModule {}
