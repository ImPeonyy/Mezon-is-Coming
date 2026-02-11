import { Injectable } from '@nestjs/common';
import { MezonClientService } from '@/lib/mezon-client/mezon-client.service';
import { isTrigger, parseCommand } from '@/utils';
import { CommandService } from '@/bots/commands/command.service';
import { ChannelMessageEvent, TokenSendEvent } from '@/constants';

@Injectable()
export class ListenersService {
    constructor(
        private readonly mezonClientService: MezonClientService,
        private readonly commandService: CommandService,
    ) {}

    async onModuleInit() {
        this.onMessage();
        this.onTokenSend();
    }

    async onMessage() {
        this.mezonClientService.getClient().onChannelMessage(async (event: ChannelMessageEvent) => {
            if (event.sender_id === this.mezonClientService.getClient().clientId) {
                return;
            }

            if (isTrigger(event.content.t)) {
                const { commandName, args } = parseCommand(event.content.t);

                await this.commandService.handle(event, commandName, args);
            }
        });
    }

    async onTokenSend() {
        this.mezonClientService.getClient().onTokenSend(async (event: TokenSendEvent) => {
            if (event.sender_id === this.mezonClientService.getClient().clientId) {
                return;
            }

            await this.mezonClientService.handleTokenSend(event);
        });
    }
}
