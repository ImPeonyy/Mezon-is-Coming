import { Global, Module } from '@nestjs/common';
import { AsyncMutexService } from './async-mutex.service';

@Global()
@Module({
    providers: [AsyncMutexService],
    exports: [AsyncMutexService],
})
export class AsyncMutexModule {}
