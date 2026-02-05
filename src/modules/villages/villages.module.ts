import { Module } from '@nestjs/common';
import { VillagesService } from './villages.service';

@Module({
    providers: [VillagesService],
    exports: [VillagesService],
})
export class VillagesModule {}
