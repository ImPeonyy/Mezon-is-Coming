import { Injectable } from '@nestjs/common';
import { MezonClientService } from '@/lib/mezon-client/mezon-client.service';
import { getInteralErrorMessage, getLoadingMessage } from '@/utils';
import { CommandContext } from '@/bots/commands/command.interface';

@Injectable()
export class MiscService {
    constructor(private readonly mezonClientService: MezonClientService) {}

    async sendLoadingMessage(channelId: string, messageId: string) {
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
            'https://res.cloudinary.com/do2rk0jz8/image/upload/v1770562029/mic_hn7n6c.png';

        const spinPositionUrl =
            (process.env.SPIN_POSITION_URL as string) ||
            'https://res.cloudinary.com/do2rk0jz8/raw/upload/v1770562020/mic_tm7nww.json';

        return {
            spinImageUrl,
            spinPositionUrl,
        };
    }

    waitForTimeout(ms: number = 1000) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
