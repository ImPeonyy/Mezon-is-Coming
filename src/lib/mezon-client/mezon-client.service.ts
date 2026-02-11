import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChannelMessageContent, EMarkdownType, MezonClient } from 'mezon-sdk';
import { Message } from 'mezon-sdk/dist/cjs/mezon-client/structures/Message';
import { UsersService } from '@/modules/users/users.service';
import { generateInviteCode } from '@/utils';
import { DEFAULT_AVATAR } from '@/constants/misc.constant';
import { PrismaService } from '../prisma/prisma.service';
import { User as MezonUser } from 'mezon-sdk/dist/cjs/mezon-client/structures/User';
import { TokenSendEvent } from '@/constants';

@Injectable()
export class MezonClientService implements OnModuleInit {
    private client: MezonClient;

    constructor(private readonly prisma: PrismaService, private readonly usersService: UsersService) {
        this.client = new MezonClient({
            token: process.env.MEZON_BOT_TOKEN as string,
            botId: process.env.MEZON_BOT_ID as string,
        });
    }

    async onModuleInit() {
        await this.client
            .login()
            .then(() => {
                this.usersService.initBot(this.client.clientId);
                console.log('🌸 Bot đã được khởi động!');
            })
            .catch((error) => {
                console.error('❌ Lỗi khi đăng nhập bot:', error);
            });
    }

    getClient(): MezonClient {
        return this.client;
    }

    async sendChannelMessage(channelId: string, messageContent: ChannelMessageContent) {
        try {
            const channel = await this.client.channels.fetch(channelId);

            await channel.send(messageContent);
        } catch (error) {
            console.error('❌ Lỗi khi gửi tin nhắn:', error);
        }
    }

    async replyMessage(channelId: string, messageId: string, messageContent: ChannelMessageContent) {
        try {
            const channel = await this.client.channels.fetch(channelId);
            const messageFetched = await channel.messages.fetch(messageId);

            return await messageFetched.reply(messageContent);
        } catch (error) {
            console.error('❌ Lỗi khi trả lời tin nhắn:', error);
        }
    }

    async updateMessage(message: Message, messageContent: ChannelMessageContent) {
        try {
            return await message.update(messageContent);
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật tin nhắn:', error);
        }
    }

    async senDMMessage(mezonId: string, messageContent: ChannelMessageContent): Promise<void> {
        let userFetched: MezonUser;
        try {
            userFetched = await this.client.users.fetch(mezonId);
            await userFetched.sendDM(messageContent);
        } catch (error) {
            console.error('❌ Lỗi khi gửi tin nhắn DM cho user:', userFetched.username, '| Mezon:', error);
        }
    }

    async handleTokenSend(event: TokenSendEvent) {
        try {
            const { sender_id, amount, sender_name } = event;
            await this.prisma.$transaction(async (tx) => {
                await this.usersService.upsertUser(
                    tx,
                    { mezon_id: sender_id },
                    {
                        mezon_token_balance: {
                            increment: Number(amount),
                        },
                        total_mezon_token: {
                            increment: Number(amount),
                        },
                    },
                    {
                        mezon_id: sender_id,
                        username: sender_name,
                        invite_code: generateInviteCode(sender_name),
                        avatar: DEFAULT_AVATAR,
                        mezon_token_balance: Number(amount),
                        total_mezon_token: Number(amount),
                    },
                );

                await this.usersService.updateUser(
                    tx,
                    { mezon_id: this.client.clientId },
                    {
                        mezon_token_balance: {
                            increment: Number(amount),
                        },
                        total_mezon_token: {
                            increment: Number(amount),
                        },
                    },
                );
            });

            await Promise.all([
                this.senDMMessage(sender_id, {
                    t: `🌸 Bạn đã nạp thành công ${amount}₫`,
                    mk: [
                        {
                            type: EMarkdownType.CODE,
                            s: 25,
                            e: 25 + amount.toString().length + 1,
                        },
                    ],
                }),
                this.senDMMessage(process.env.ADMIN_MEZON_ID as string, {
                    t: `🌸 ${sender_name} đã nạp thành công ${amount}₫`,
                    mk: [
                        {
                            type: EMarkdownType.BOLD,
                            s: 3,
                            e: 3 + sender_name.length,
                        },
                        {
                            type: EMarkdownType.CODE,
                            s: 3 + sender_name.length + 19,
                            e: 3 + sender_name.length + 19 + amount.toString().length + 1,
                        },
                    ],
                }),
            ]);
        } catch (error) {
            console.error('❌ Lỗi khi xử lý giao dịch token:', error);
        }
    }
}
