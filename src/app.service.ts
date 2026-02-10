import { Injectable } from '@nestjs/common';
import { ListenersService } from '@bots/listeners/listeners.service';
import { MezonClientService } from '@/lib/mezon-client/mezon-client.service';
import { RedisService } from './lib/redis/redis.service';

@Injectable()
export class AppService {
    constructor(
        private readonly mezonClientService: MezonClientService,
        private readonly redisService: RedisService,
        private readonly listenersService: ListenersService,
    ) {}

    async onModuleInit() {
        this.mezonClientService.onModuleInit();
        this.redisService.onModuleInit();
        this.listenersService.onModuleInit();
    }
}
