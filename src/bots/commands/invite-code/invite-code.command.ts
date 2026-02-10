import { Injectable } from '@nestjs/common';
import { BotCommand, CommandContext } from '../command.interface';
import { MezonClientService } from '@/lib/mezon-client/mezon-client.service';
import { UsersService } from '@/modules/users/users.service';
import { MiscService } from '@/modules/misc/misc.service';
import { EMarkdownType } from 'mezon-sdk';

@Injectable()
export class InviteCodeCommand implements BotCommand {
    name = 'inv-code';
    isPublic = false;

    constructor(
        private readonly mezonClientService: MezonClientService,
        private readonly miscService: MiscService,
        private readonly usersService: UsersService,
    ) {}

    async execute(ctx: CommandContext) {
        const { event, repliedMessage } = ctx;
        try {
            const user = await this.usersService.getUser({ mezon_id: event.sender_id });

            await this.mezonClientService.updateMessage(repliedMessage, {
                t: `🌸 Mã mời của bạn là: ${user.invite_code}`,
                mk: [
                    {
                        type: EMarkdownType.PRE,
                        s: 22,
                        e: 22 + user.invite_code.length,
                    },
                ],
            });
        } catch (error) {
            console.error('❌ Lỗi khi thực hiện lệnh `regis`:', error);
            await this.miscService.handleCommandError(ctx);
        }
    }
}
