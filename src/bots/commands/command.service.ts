import { Injectable } from '@nestjs/common';
import { BotCommand } from './command.interface';
import { ChannelMessageEvent } from '@/constants';
import { UsersService } from '@/modules/users/users.service';
import { MezonClientService } from '@/lib/mezon-client/mezon-client.service';
import { Message } from 'mezon-sdk/dist/cjs/mezon-client/structures/Message';
import { MiscService } from '@/modules/misc/misc.service';
import { Spin, User, Village } from '@generated/prisma/client';

import { RegisCommand } from './regis/regis.command';
import { SpinCommand } from './spin/spin.command';
import { InviteCodeCommand } from './invite-code/invite-code.command';

@Injectable()
export class CommandService {
    private commands = new Map<string, BotCommand>();

    constructor(
        private readonly mcService: MezonClientService,
        private readonly miscService: MiscService,
        private readonly usersService: UsersService,
        private readonly regisCommand: RegisCommand,
        private readonly spinCommand: SpinCommand,
        private readonly inviteCodeCommand: InviteCodeCommand,
    ) {
        this.register(this.regisCommand);
        this.register(this.spinCommand);
        this.register(this.inviteCodeCommand);
    }

    register(command: BotCommand) {
        this.commands.set(command.name, command);
    }

    async handle(event: ChannelMessageEvent, commandName: string, args: string[]) {
        let repliedMessage: Message;
        let entryUser: User & { spin: Spin; village: Village };

        try {
            const message = await this.miscService.sendLoadingMessage(event.channel_id, event.message_id);
            const channel = await this.mcService.getClient().channels.fetch(event.channel_id);

            repliedMessage = await channel.messages.fetch(message.message_id);

            const command = this.commands.get(commandName);

            if (!command) {
                await this.mcService.updateMessage(repliedMessage, {
                    t: '❓ Lệnh không tồn tại! Vui lòng thử lại!',
                });
                return;
            }

            if (!command.isPublic) {
                entryUser = await this.usersService.getEntryUser({ mezon_id: event.sender_id });

                if (!entryUser) {
                    await this.mcService.updateMessage(repliedMessage, {
                        t: '❌ Bạn chưa đăng ký tài khoản! Hãy dùng lệnh `*mic regis` để đăng ký tài khoản!',
                    });
                    return;
                }
            }

            await command.execute({ event, repliedMessage, entryUser, args });
        } catch (error) {
            console.error('❌ Lỗi khi thực hiện lệnh `', commandName, '` | root:', error);
            this.miscService.handleCommandError({ event, repliedMessage, entryUser, args });
        }
    }
}
