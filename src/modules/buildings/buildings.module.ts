import { Module } from '@nestjs/common';
import { BuildingsService } from './buildings.service';

@Module({
    providers: [BuildingsService],
    exports: [BuildingsService],
})
export class BuildingsModule {}
