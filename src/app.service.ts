import { Injectable } from '@nestjs/common';
import { ListenersService } from '@bots/listeners/listeners.service';
import { MezonClientService } from '@/lib/mezon-client/mezon-client.service';

@Injectable()
export class AppService {
    constructor(
        private readonly listenersService: ListenersService,
        private readonly mezonClientService: MezonClientService,
    ) {}

    async onModuleInit() {
        this.mezonClientService.onModuleInit();
        this.listenersService.onModuleInit();
    }
}
