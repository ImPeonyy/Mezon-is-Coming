import { ChannelMessageEvent } from '@/constants';
import { Message } from 'mezon-sdk/dist/cjs/mezon-client/structures/Message';
import { Spin, Village, User } from '@generated/prisma/client';
export interface BotCommand {
    name: string;
    isPublic: boolean;
    execute(ctx: CommandContext): Promise<void>;
}

export interface CommandContext {
    event: ChannelMessageEvent;
    repliedMessage: Message;
    entryUser: User & { spin: Spin; village: Village };
    args: string[];
}
