import { Injectable } from '@nestjs/common';
import { BotCommand, CommandContext } from '../command.interface';
import { MezonClientService } from '@/lib/mezon-client/mezon-client.service';
import { getEmbedLoadingMessage, getRandomPastelHexColor, getTextMessage } from '@/utils';
import { UsersService } from '@/modules/users/users.service';
import { MiscService } from '@/modules/misc/misc.service';
import { IMAGE_TO_SPIN_TYPE, MessageButtonClickedEvent, SPIN_ITEM_REWARD, SPIN_ITEM_TYPE } from '@/constants';
import { InteractiveMessageService } from '@/lib/interactive-message/interactive-message.service';
import { AsyncMutexService } from '@/lib/async-mutex/async-mutex.service';
import {
    ButtonComponent,
    ChannelMessageContent,
    EButtonMessageStyle,
    EMessageComponentType,
    IMessageActionRow,
} from 'mezon-sdk';
import { VillagesService } from '@/modules/villages/villages.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { SpinsService } from '@/modules/spins/spins.service';
import { Spin, User } from '@generated/prisma/client';
import { BuildingsService } from '@/modules/buildings/buildings.service';
import { StatisticsService } from '@/modules/statistics/statistics.service';

@Injectable()
export class SpinCommand implements BotCommand {
    name = 'spin';
    isPublic = false;

    constructor(
        private readonly mcService: MezonClientService,
        private readonly prisma: PrismaService,
        private readonly miscService: MiscService,
        private readonly imService: InteractiveMessageService,
        private readonly amService: AsyncMutexService,
        private readonly usersService: UsersService,
        private readonly villagesService: VillagesService,
        private readonly spinsService: SpinsService,
        private readonly buildingsService: BuildingsService,
        private readonly statisticsService: StatisticsService,
    ) {}

    spin = (): string[][] => {
        const results: string[][] = [];
        const number = [0, 0, 0];

        const spinImages = Array.from(IMAGE_TO_SPIN_TYPE.keys());
        for (let i = 0; i < 3; i++) {
            number[i] = Math.floor(Math.random() * spinImages.length);
            const result = [...spinImages, spinImages[number[i]]];
            results.push(result);
        }

        return results;
    };

    getInitSpinResult = (): string[][] => {
        const initResults: string[][] = [];
        const randomNumber = Math.floor(Math.random() * 9) + 1;

        const spinImages = Array.from(IMAGE_TO_SPIN_TYPE.keys());
        for (let i = 0; i < 3; i++) {
            const result = [...spinImages, spinImages[randomNumber]];
            initResults.push(result);
        }

        return initResults;
    };

    getSpinButton = (balance: number): IMessageActionRow => {
        const lowSpin = [2, 3, 5];
        const midLowSpin = [10, 15, 20];
        const mediumSpin = [25, 30, 50];
        const highMediumSpin = [100, 150, 200];
        const highSpin = [250, 300, 500];

        const pickMaxAvailable = (arr: number[]): number | null => {
            const available = arr.filter((v) => v <= balance);
            return available.length ? available[available.length - 1] : null;
        };

        const cancelButton: ButtonComponent = {
            id: 'spin-cancel',
            type: EMessageComponentType.BUTTON,
            component: {
                label: 'Cancel',
                style: EButtonMessageStyle.DANGER,
            },
        };

        const spinX1Button: ButtonComponent = {
            id: 'spin-x1',
            type: EMessageComponentType.BUTTON,
            component: {
                label: '🎰',
                style: EButtonMessageStyle.PRIMARY,
            },
        };

        const tiers = [
            pickMaxAvailable(lowSpin),
            pickMaxAvailable(midLowSpin),
            pickMaxAvailable(mediumSpin),
            pickMaxAvailable(highMediumSpin),
            pickMaxAvailable(highSpin),
        ].filter((v): v is number => v !== null);

        const tierButtons: ButtonComponent[] = tiers.map((v) => ({
            id: `spin-x${v}`,
            type: EMessageComponentType.BUTTON,
            component: {
                label: `🎰x${v}`,
                style: EButtonMessageStyle.PRIMARY,
            },
        }));

        return {
            components: [balance > 0 && spinX1Button, ...tierButtons, cancelButton],
        };
    };

    getSpinMessage = ({
        results,
        balance,
        repeat,
        duration,
        isLoading = false,
        notiMessage = '',
    }: {
        results: string[][];
        balance: number;
        repeat: number;
        duration: number;
        isLoading?: boolean;
        notiMessage?: string;
    }): ChannelMessageContent => {
        const { spinImageUrl, spinPositionUrl } = this.miscService.getSpinImageResource();

        const spinMessage = {
            color: getRandomPastelHexColor(),
            title: '🎰 Spin Slots 🎰',
            description: `Bạn đang có ${balance} năng lượng!`,
            fields: [
                {
                    name: '',
                    value: '',
                    inputs: {
                        id: `slots`,
                        type: EMessageComponentType.ANIMATION,
                        component: {
                            url_image: spinImageUrl,
                            url_position: spinPositionUrl,
                            pool: results,
                            repeat: repeat,
                            duration: duration,
                        },
                    },
                },
                {
                    name: `${balance > 0 || notiMessage ? notiMessage : '🌸 Bạn đã hết năng lượng! 🌸'}`,
                    value: '',
                },
            ],
        };

        return {
            embed: [spinMessage],
            components: isLoading ? [] : [this.getSpinButton(balance)],
        };
    };

    getSelectTargetMessage = (
        type: 'attack' | 'raid',
        targetUsers: User[],
        spinAmount: number,
    ): ChannelMessageContent => {
        const targetUserOptions = targetUsers.map((user) => ({
            label: user.username,
            value: user.id.toString(),
        }));

        const selectTargetButton: ButtonComponent = {
            id: `select-target-${type}-${spinAmount}`,
            type: EMessageComponentType.BUTTON,
            component: {
                label: 'Tiếp tục',
                style: EButtonMessageStyle.PRIMARY,
            },
        };

        const selectTargetMessage = {
            color: getRandomPastelHexColor(),
            title: `Bạn đã nhận được 1 lượt ${type === 'attack' ? 'tấn công' : 'trộm'}!`,
            description: `Chọn người bạn muốn ${type === 'attack' ? 'tấn công' : 'trộm'}!\n Để trống để ${
                type === 'attack' ? 'tấn công' : 'trộm'
            } ngẫu nhiên!`,
            fields: [
                {
                    name: `Chọn người bạn muốn ${type === 'attack' ? 'tấn công' : 'trộm'}:`,
                    value: '',
                    inputs: {
                        id: `target`,
                        type: EMessageComponentType.SELECT,
                        component: {
                            options: targetUserOptions,
                        },
                    },
                },
            ],
        };

        return {
            embed: [selectTargetMessage],
            components: [
                {
                    components: [selectTargetButton],
                },
            ],
        };
    };

    getSpinItems = (results: string[][]): string[] => {
        return results.map((reel) => {
            const lastImage = reel[5];

            return IMAGE_TO_SPIN_TYPE.get(lastImage);
        });
    };

    getCoinRewardByLevel = (level: number) => {
        return Math.round(1000 * level * 1.36);
    };

    getCoinBagRewardByLevel = (level: number) => {
        return Math.round(5000 * level * 1.63);
    };

    getSpinReward = (items: string[], level: number) => {
        if (items.length !== 3) {
            return null;
        }
        if (items[0] === items[1] && items[1] === items[2]) {
            const itemType = items[0];

            switch (itemType) {
                case SPIN_ITEM_TYPE.COIN:
                    return {
                        type: SPIN_ITEM_REWARD.COIN,
                        amount: this.getCoinRewardByLevel(level) * 3,
                    };
                case SPIN_ITEM_TYPE.COIN_BAG:
                    return {
                        type: SPIN_ITEM_REWARD.COIN,
                        amount: this.getCoinBagRewardByLevel(level) * 5,
                    };
                case SPIN_ITEM_TYPE.ENERGY:
                    return {
                        type: SPIN_ITEM_REWARD.ENERGY,
                        amount: 1,
                    };
                case SPIN_ITEM_TYPE.ATTACK:
                    return {
                        type: SPIN_ITEM_REWARD.ATTACK,
                        amount: 1,
                    };
                case SPIN_ITEM_TYPE.RAID:
                    return {
                        type: SPIN_ITEM_REWARD.RAID,
                        amount: 1,
                    };
                case SPIN_ITEM_TYPE.SHIELD:
                    return {
                        type: SPIN_ITEM_REWARD.SHIELD,
                        amount: 3,
                    };
                default:
                    return null;
            }
        } else {
            const coinCount = items.filter((i) => i === SPIN_ITEM_TYPE.COIN).length;
            const bagCount = items.filter((i) => i === SPIN_ITEM_TYPE.COIN_BAG).length;

            if (coinCount === 0 && bagCount === 0) {
                return null;
            }

            const coinFromCoin = coinCount * this.getCoinRewardByLevel(level);
            const coinFromBag = bagCount * this.getCoinBagRewardByLevel(level);

            const totalCoin = coinFromCoin + coinFromBag;

            return {
                type: SPIN_ITEM_REWARD.COIN,
                amount: totalCoin,
            };
        }
    };

    async execute(ctx: CommandContext) {
        const { repliedMessage, entryUser } = ctx;
        try {
            this.mcService.updateMessage(
                repliedMessage,
                this.getSpinMessage({
                    results: this.getInitSpinResult(),
                    balance: entryUser.spin.spin_balance,
                    repeat: 1,
                    duration: 0.1,
                    isLoading: false,
                    notiMessage: '',
                }),
            );

            const expireTimer = setTimeout(() => {
                this.imService.forceClose(entryUser.id, this.name, '🌸 Chúc bạn chơi vui vẻ!');
            }, 3 * 60 * 1000);

            await this.imService.register({
                userId: entryUser.id,
                message: repliedMessage,
                expireTimer,
                type: this.name,
            });

            this.mcService.getClient().onMessageButtonClicked(async (mbcEvent: MessageButtonClickedEvent) => {
                if (
                    mbcEvent.channel_id === repliedMessage.channel.id &&
                    mbcEvent.message_id === repliedMessage.id &&
                    mbcEvent.user_id === entryUser.mezon_id
                ) {
                    if (mbcEvent.button_id === 'spin-cancel') {
                        this.imService.forceClose(entryUser.id, this.name, '🌸 Chúc bạn chơi vui vẻ!');
                        return;
                    }

                    if (this.amService.isLocked({ userId: entryUser.id, type: this.name })) {
                        return;
                    }

                    await this.amService.runExclusive({ userId: entryUser.id, type: this.name }, async () => {
                        if (mbcEvent.button_id.startsWith('spin-x')) {
                            const spinAmount = parseInt(mbcEvent.button_id.split('spin-x')[1]);
                            const spinResults = this.spin();

                            await this.mcService.updateMessage(
                                repliedMessage,
                                getEmbedLoadingMessage('🎰 Spin Slots 🎰'),
                            );

                            await this.miscService.waitForTimeout(1000);

                            const spinReward = this.getSpinReward(
                                this.getSpinItems(spinResults),
                                entryUser.village.level,
                            );

                            if (spinReward?.type === SPIN_ITEM_REWARD.ATTACK) {
                                await this.mcService.updateMessage(
                                    repliedMessage,
                                    this.getSpinMessage({
                                        results: spinResults,
                                        balance: entryUser.spin.spin_balance,
                                        repeat: 2,
                                        duration: 0.5,
                                        isLoading: true,
                                        notiMessage: '🌸 Bạn đã nhận được 1 lượt tấn công! 🌸',
                                    }),
                                );

                                const targetUsers = await this.usersService.getTargetUser(entryUser.id);

                                await this.miscService.waitForTimeout(2500);

                                await this.mcService.updateMessage(
                                    repliedMessage,
                                    this.getSelectTargetMessage('attack', targetUsers, spinAmount),
                                );
                            }

                            if (spinReward?.type === SPIN_ITEM_REWARD.RAID) {
                                await this.mcService.updateMessage(
                                    repliedMessage,
                                    this.getSpinMessage({
                                        results: spinResults,
                                        balance: entryUser.spin.spin_balance,
                                        repeat: 2,
                                        duration: 0.5,
                                        isLoading: true,
                                        notiMessage: '🌸 Bạn đã nhận được 1 lượt trộm! 🌸',
                                    }),
                                );

                                const targetUsers = await this.usersService.getTargetUser(entryUser.id);

                                await this.miscService.waitForTimeout(2500);

                                await this.mcService.updateMessage(
                                    repliedMessage,
                                    this.getSelectTargetMessage('raid', targetUsers, spinAmount),
                                );
                            }

                            if (spinReward?.type === SPIN_ITEM_REWARD.SHIELD) {
                                const maxShield = 3;
                                let remainingShield = 0;
                                let spinUpdated: Spin;

                                const totalShield = spinReward.amount * spinAmount;

                                if (totalShield + entryUser.village.shield > maxShield) {
                                    remainingShield = totalShield + entryUser.village.shield - maxShield;
                                }

                                const spinCost = spinAmount - remainingShield;

                                await this.prisma.$transaction(async (tx) => {
                                    await this.villagesService.updateVillage(
                                        tx,
                                        { id: entryUser.village.id },
                                        { shield: { increment: totalShield - remainingShield } },
                                    );

                                    if (spinCost > 0) {
                                        spinUpdated = await this.spinsService.updateSpin(
                                            tx,
                                            { id: entryUser.spin.id },
                                            { spin_balance: { decrement: spinCost }, last_spin_at: new Date() },
                                        );

                                        await this.statisticsService.updateStatistic(
                                            tx,
                                            { user_id: entryUser.id },
                                            { total_spined: { increment: spinCost },
                                            spin_win_count: { increment: spinCost }, 
                                        }
                                        );
                                    }
                                });

                                await this.mcService.updateMessage(
                                    repliedMessage,
                                    this.getSpinMessage({
                                        results: spinResults,
                                        balance: spinUpdated.spin_balance,
                                        repeat: 2,
                                        duration: 0.5,
                                        isLoading: false,
                                        notiMessage: `🌸 Bạn đã nhận được ${totalShield} lượt bảo vệ! 🌸\n Bạn được hoàn trả ${remainingShield} năng lượng!`,
                                    }),
                                );
                            }

                            if (spinReward?.type === SPIN_ITEM_REWARD.ENERGY) {
                                const totalEnergy = spinReward.amount * spinAmount;
                                let spinUpdated: Spin;

                                await this.prisma.$transaction(async (tx) => {
                                spinUpdated = await this.spinsService.updateSpin(
                                    tx,
                                    { id: entryUser.spin.id },
                                    { spin_balance: { increment: totalEnergy }, last_spin_at: new Date() },
                                );

                                await this.statisticsService.updateStatistic(
                                            tx,
                                            { user_id: entryUser.id },
                                            { total_spined: { increment: spinAmount },
                                            spin_win_count: { increment: spinAmount }, 
                                        }
                                );
                                });

                                await this.mcService.updateMessage(
                                    repliedMessage,
                                    this.getSpinMessage({
                                        results: spinResults,
                                        balance: spinUpdated.spin_balance,
                                        repeat: 2,
                                        duration: 0.5,
                                        isLoading: false,
                                        notiMessage: `🌸 Bạn đã nhận được ${totalEnergy} năng lượng! 🌸`,
                                    }),
                                );
                            }

                            if (spinReward?.type === SPIN_ITEM_REWARD.COIN) {
                                const totalCoin = spinReward.amount * spinAmount;

                                let spinUpdated: Spin;

                                await this.prisma.$transaction(async (tx) => {
                                    await this.usersService.updateUser(
                                        tx,
                                        { id: entryUser.id },
                                        { coin: { increment: spinReward.amount * spinAmount } },
                                    );

                                    spinUpdated = await this.spinsService.updateSpin(
                                        tx,
                                        { id: entryUser.spin.id },
                                        { spin_balance: { decrement: spinAmount }, last_spin_at: new Date() },
                                    );

                                    await this.statisticsService.updateStatistic(
                                        tx,
                                        { user_id: entryUser.id },
                                        { total_spined: { increment: spinAmount },
                                        spin_win_count: { increment: spinAmount }, 
                                        total_coin_from_spin: { increment: spinReward.amount * spinAmount },
                                    }
                                    );
                                });

                                await this.mcService.updateMessage(
                                    repliedMessage,
                                    this.getSpinMessage({
                                        results: spinResults,
                                        balance: spinUpdated.spin_balance,
                                        repeat: 2,
                                        duration: 0.36,
                                        isLoading: false,
                                        notiMessage: `🌸 Bạn đã nhận được ${totalCoin} coin! 🌸`,
                                    }),
                                );
                            }

                            if (spinReward === null) {
                                let spinUpdated: Spin;
                                await this.prisma.$transaction(async (tx) => {
                                spinUpdated = await this.spinsService.updateSpin(
                                    tx,
                                    { id: entryUser.spin.id },
                                    { spin_balance: { decrement: spinAmount }, last_spin_at: new Date() },
                                );

                                await this.statisticsService.updateStatistic(
                                    tx,
                                    { user_id: entryUser.id },
                                    { total_spined: { increment: spinAmount },
                                }
                                );
                                });

                                await this.mcService.updateMessage(
                                    repliedMessage,
                                    this.getSpinMessage({
                                        results: spinResults,
                                        balance: spinUpdated.spin_balance,
                                        repeat: 2,
                                        duration: 0.36,
                                        isLoading: false,
                                        notiMessage: '🌸 Chúc bạn may mắn lần sau! 🌸',
                                    }),
                                );
                            }
                        }

                        if (mbcEvent.button_id.startsWith('select-target-attack')) {
                            const target = JSON.parse(mbcEvent.extra_data);
                            const targetId = target['target'];
                            const spinAmount = parseInt(mbcEvent.button_id.split('select-target-attack-')[1]);

                            const targetUser = await this.usersService.getUserWithVillage({
                                id: parseInt(targetId),
                            });

                            if (targetUser.village.shield > 0) {
                                await this.prisma.$transaction(async (tx) => {
                                    await this.villagesService.updateVillage(
                                        tx,
                                        { id: targetUser.village.id },
                                        { shield: { decrement: 1 } },
                                    );

                                    await this.usersService.updateUser(
                                        tx,
                                        { id: targetUser.id },
                                        { coin: { increment: 10000 * spinAmount } },
                                    );

                                    await this.statisticsService.updateStatistic(
                                        tx,
                                        { user_id: entryUser.id },
                                        { total_spined: { increment: spinAmount },
                                        spin_win_count: { increment: spinAmount },
                                        attack_count: { increment: 1 },
                                        shield_break_count: { increment: 1 },
                                    }
                                    );

                                    await this.statisticsService.updateStatistic(
                                        tx,
                                        { user_id: targetUser.id },
                                        { attacked_count: { increment: 1 },
                                        shield_blocked_count: { increment: 1 },
                                    }
                                    );
                                });

                                const spinUpdated = await this.spinsService.updateSpin(
                                    this.prisma,
                                    { id: entryUser.spin.id },
                                    { spin_balance: { decrement: spinAmount }, last_spin_at: new Date() },
                                );

                                await this.mcService.updateMessage(
                                    repliedMessage,
                                    getTextMessage('🌸 Đối phương đã bảo vệ thành công! 🌸'),
                                );
                                await this.miscService.waitForTimeout(1000);
                                await this.mcService.updateMessage(
                                    repliedMessage,
                                    this.getSpinMessage({
                                        results: this.getInitSpinResult(),
                                        balance: spinUpdated.spin_balance,
                                        repeat: 1,
                                        duration: 0.1,
                                        isLoading: false,
                                        notiMessage: '',
                                    }),
                                );
                            } else {
                                await this.prisma.$transaction(async (tx) => {
                                    const targetBuilding = await tx.building.findFirst({
                                        where: {
                                            village_id: targetUser.village.id,
                                            level: {
                                                gt: 1,
                                            },
                                        },
                                        select: {
                                            type: true,
                                        },
                                    });

                                    if (!targetBuilding) {
                                        return;
                                    }

                                    const downgraded = await this.buildingsService.downgradeBuilding(
                                        tx,
                                        targetUser.village.id,
                                        targetBuilding.type,
                                    );

                                    if (!downgraded) {
                                        return;
                                    }

                                    await this.usersService.updateUser(
                                        tx,
                                        { id: targetUser.id },
                                        { coin: { increment: 20000 * spinAmount } },
                                    );

                                    await this.spinsService.updateSpin(
                                        this.prisma,
                                        { id: entryUser.spin.id },
                                        { spin_balance: { decrement: spinAmount }, last_spin_at: new Date() },
                                    );

                                    await this.statisticsService.updateStatistic(
                                        tx,
                                        { user_id: entryUser.id },
                                        { total_spined: { increment: spinAmount },
                                        spin_win_count: { increment: spinAmount },
                                        attack_count: { increment: 1 },
                                        attack_success_count: { increment: 1 },
                                    }
                                    );

                                    await this.statisticsService.updateStatistic(
                                        tx,
                                        { user_id: targetUser.id },
                                        { attacked_count: { increment: 1 },
                                    }
                                    );
                                });

                                await this.imService.forceClose(
                                    entryUser.id,
                                    this.name,
                                    `🌸 Bạn đã tấn công ${targetUser.username} thành công! 🌸`,
                                );
                            }

                            await this.mcService.senDMMessage(
                                targetUser.mezon_id,
                                getTextMessage(`🌸 Bạn đã bị tấn công bởi ${entryUser.username}! 🌸`),
                            );
                        }

                        if (mbcEvent.button_id.startsWith('select-target-raid')) {
                            const target = JSON.parse(mbcEvent.extra_data);
                            const targetId = target['target'];
                            const spinAmount = parseInt(mbcEvent.button_id.split('select-target-raid-')[1]);

                            const targetUser = await this.usersService.getUserWithVillage({
                                id: parseInt(targetId),
                            });

                            const percentage = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
                            const rawStolen = Math.round((targetUser.coin * percentage) / 100);

                            if (rawStolen <= 0) {
                                await this.mcService.updateMessage(
                                    repliedMessage,
                                    getTextMessage(`🌸 ${targetUser.username} hiện không có coin để trộm! 🌸`),
                                );
                                return;
                            }

                            const stolenAmount = rawStolen * spinAmount;

                            await this.prisma.$transaction(async (tx) => {
                                await this.usersService.updateUser(
                                    tx,
                                    { id: targetUser.id },
                                    {
                                        coin: {
                                            decrement: Math.min(stolenAmount, targetUser.coin),
                                        },
                                    },
                                );

                                await this.usersService.updateUser(
                                    tx,
                                    { id: entryUser.id },
                                    {
                                        coin: {
                                            increment: stolenAmount,
                                        },
                                    },
                                );

                                await this.spinsService.updateSpin(
                                    tx,
                                    { id: entryUser.spin.id },
                                    {
                                        spin_balance: { decrement: spinAmount },
                                        last_spin_at: new Date(),
                                    },
                                );

                                const statistic = await this.statisticsService.getStatistic(tx, { user_id: entryUser.id });
                                const bestRaid = Math.max(statistic.best_raid, stolenAmount);

                                await this.statisticsService.updateStatistic(
                                    tx,
                                    { user_id: entryUser.id },
                                    { total_spined: { increment: spinAmount },
                                    spin_win_count: { increment: spinAmount },
                                    raid_count: { increment: 1 },
                                    total_coin_from_raid: { increment: stolenAmount },
                                    best_raid: { set: bestRaid },
                                });

                                await this.statisticsService.updateStatistic(
                                    tx,
                                    { user_id: targetUser.id },
                                    { raided_count: { increment: 1 },
                                });
                            });

                            await this.imService.forceClose(
                                entryUser.id,
                                this.name,
                                `🌸 Bạn đã trộm được ${stolenAmount} coin từ ${targetUser.username} (${percentage}%)! 🌸`,
                            );

                            await this.mcService.senDMMessage(
                                targetUser.mezon_id,
                                getTextMessage(
                                    `🌸 Bạn đã bị ${entryUser.username} trộm mất ${stolenAmount} coin (${percentage}%)! 🌸`,
                                ),
                            );
                        }
                    });
                }
            });
        } catch (error) {
            console.error('❌ Lỗi khi thực hiện lệnh `spin`:', error);
            this.miscService.handleCommandError(ctx);
        }
    }
}
