import { Injectable } from '@nestjs/common';
import { MezonClientService } from '@/lib/mezon-client/mezon-client.service';
import { getInteralErrorMessage, getLoadingMessage } from '@/utils';
import { Message } from 'mezon-sdk/dist/cjs/mezon-client/structures/Message';
import { CommandContext } from '@/bots/commands/command.interface';

@Injectable()
export class MiscService {
    constructor(private readonly mezonClientService: MezonClientService) {}

    async sendLoadingMessage(channelId: string, messageId: string): Promise<Message> {
        return await this.mezonClientService.replyMessage(channelId, messageId, getLoadingMessage());
    }

    async handleCommandError(ctx: CommandContext) {
        if (ctx.repliedMessage) {
            await this.mezonClientService.updateMessage(ctx.repliedMessage, getInteralErrorMessage());
        } else {
            await this.mezonClientService.replyMessage(
                ctx.event.channel_id,
                ctx.event.message_id,
                getInteralErrorMessage(),
            );
        }
    }

    getSpinImageResource(): { spinImageUrl: string; spinPositionUrl: string } {
        const spinImageUrl =
            (process.env.SPIN_IMAGE_URL as string) ||
            'https://res.cloudinary.com/do2rk0jz8/image/upload/v1770113713/Mezon_is_Coming_bso288.png';

        const spinPositionUrl =
            (process.env.SPIN_POSITION_URL as string) ||
            'https://res.cloudinary.com/do2rk0jz8/raw/upload/v1770113712/Mezon_is_Coming_bo12vg.json';

        return {
            spinImageUrl,
            spinPositionUrl,
        };
    }
}
