import { Injectable } from '@nestjs/common';
import { BotCommand, CommandContext } from '../command.interface';
import { MezonClientService } from '@/lib/mezon-client/mezon-client.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { UsersService } from '@/modules/users/users.service';
import { VillagesService } from '@/modules/villages/villages.service';
import { BuildingsService } from '@/modules/buildings/buildings.service';
import { StatisticsService } from '@/modules/statistics/statistics.service';
import { SpinsService } from '@/modules/spins/spins.service';
import { MiscService } from '@/modules/misc/misc.service';
import { Message } from 'mezon-sdk/dist/cjs/mezon-client/structures/Message';
import { Spin, User } from '@generated/prisma/client';

const INVITE_REWARD = {
    coin: 111111,
    spin: 100,
};

const NORMAL_REWARD = {
    coin: 66666,
    spin: 50,
};

const INVITER_REWARD = {
    coin: 100000,
    spin: 20,
};

@Injectable()
export class RegisCommand implements BotCommand {
    name = 'regis';
    isPublic = true;

    constructor(
        private readonly mezonClientService: MezonClientService,
        private readonly miscService: MiscService,
        private readonly prisma: PrismaService,
        private readonly usersService: UsersService,
        private readonly villagesService: VillagesService,
        private readonly buildingsService: BuildingsService,
        private readonly statisticsService: StatisticsService,
        private readonly spinsService: SpinsService,
    ) {}

    private isValidInviteCode(inviteCode: string): boolean {
        if (!inviteCode) return false;
        return inviteCode.startsWith('invite_');
    }

    async isExistInviteCode(repliedMessage: Message, inviteCode: string): Promise<(User & { spin: Spin }) | null> {
        if (!this.isValidInviteCode(inviteCode)) {
            await this.mezonClientService.updateMessage(repliedMessage, {
                t: '❌ Mã mời không hợp lệ!',
            });
            return null;
        }

        const inviteUser = await this.usersService.getUserWithSpin({ invite_code: inviteCode });
        if (!inviteUser) {
            await this.mezonClientService.updateMessage(repliedMessage, {
                t: '❌ Mã mời không tồn tại!',
            });
            return null;
        }

        return inviteUser;
    }

    async execute(ctx: CommandContext) {
        const { event, repliedMessage, args } = ctx;
        try {
            const user = await this.usersService.getEntryUser({ mezon_id: event.sender_id });
            if (user) {
                await this.mezonClientService.updateMessage(repliedMessage, {
                    t: '⚠️ Bạn đã đăng ký tài khoản!',
                });
                return;
            }

            const inviteCode = args[0];
            const inviteUser = await this.isExistInviteCode(repliedMessage, inviteCode);

            await this.prisma.$transaction(async (tx) => {
                const initUser = await this.usersService.initUser(
                    tx,
                    event.sender_id,
                    event.username,
                    event.avatar,
                    inviteUser ? INVITE_REWARD.coin : NORMAL_REWARD.coin,
                );
                const initVillage = await this.villagesService.initVillage(tx, initUser.id);
                await this.buildingsService.initBuilding(tx, initVillage.id);
                await this.statisticsService.initStatistic(tx, initUser.id);
                await this.spinsService.initSpin(tx, initUser.id, inviteUser ? INVITE_REWARD.spin : NORMAL_REWARD.spin);

                if (inviteUser) {
                    await this.usersService.updateUser(
                        tx,
                        { mezon_id: inviteUser.mezon_id },
                        {
                            coin: {
                                increment: INVITER_REWARD.coin,
                            },
                        },
                    );

                    await this.spinsService.updateSpin(
                        tx,
                        { user_id: inviteUser.id },
                        {
                            spin_balance: {
                                increment: INVITER_REWARD.spin,
                            },
                        },
                    );

                    await this.mezonClientService.senDMMessage(inviteUser.mezon_id, {
                        t: `🌸 ${event.username} đã đăng ký tài khoản thành công và bạn đã nhận được ${INVITER_REWARD.coin} coin và ${INVITER_REWARD.spin} spin!`,
                    });
                }
            });

            await this.mezonClientService.updateMessage(repliedMessage, {
                t: '🌸 Bạn đã đăng ký tài khoản thành công!',
            });
        } catch (error) {
            console.error('❌ Lỗi khi thực hiện lệnh `regis`:', error);
            await this.miscService.handleCommandError(ctx);
        }
    }
}
