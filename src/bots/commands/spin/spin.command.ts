import { Injectable } from '@nestjs/common';
import { BotCommand, CommandContext } from '../command.interface';
import { MezonClientService } from '@/lib/mezon-client/mezon-client.service';
import { getRandomPastelHexColor } from '@/utils';
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
            components: [spinX1Button, ...tierButtons, cancelButton],
        };
    };

    getSpinMessage = (
        spinImageUrl: string,
        spinPositionUrl: string,
        results: string[][],
        balance: number,
    ): ChannelMessageContent => {
        const spinMessage = {
            color: getRandomPastelHexColor(),
            title: '🎰 Spin Slots 🎰',
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
                            repeat: 3,
                            duration: 1,
                        },
                    },
                },
            ],
        };

        return {
            embed: [spinMessage],
            components: [this.getSpinButton(balance)],
        };
    };

    getSelectTargetMessage = (type: 'attack' | 'raid'): ChannelMessageContent => {
        const selectTargetButton: ButtonComponent = {
            id: `${type}-select-target`,
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
                        id: `${type}-target`,
                        type: EMessageComponentType.SELECT,
                        component: {
                            options: [
                                {
                                    label: 'Người 1',
                                    value: '1',
                                },
                                {
                                    label: 'Người 2',
                                    value: '2',
                                },
                            ],
                        },
                    },
                },
            ],
        };

        return {
            embed: [selectTargetMessage],
            components: [selectTargetButton],
        };
    };

    getAttackMessage = (): ChannelMessageContent => {
        const attackButton: ButtonComponent = {
            id: 'attack',
            type: EMessageComponentType.BUTTON,
            component: {
                label: 'Tấn công',
                style: EButtonMessageStyle.PRIMARY,
            },
        };
        const attackMessage = {
            color: getRandomPastelHexColor(),
            title: 'Bạn đã nhận được 1 lượt tấn công!',
            description: 'Chọn công trình bạn muốn tấn công!\n Để trống để tấn công ngẫu nhiên!',
            fields: [
                {
                    name: 'Tower: 1/5',
                    value: '',
                    inputs: {
                        id: 'attack-tower',
                        type: EMessageComponentType.RADIO,
                        component: {
                            label: 'Tower',
                            value: 'tower',
                            style: EButtonMessageStyle.PRIMARY,
                        },
                    },
                },
                {
                    name: 'Farm: 2/5',
                    value: '',
                    inputs: {
                        id: 'attack-farm',
                        type: EMessageComponentType.RADIO,
                        component: {
                            label: 'Farm',
                            value: 'farm',
                            style: EButtonMessageStyle.PRIMARY,
                        },
                    },
                },
                {
                    name: 'Pet Statue: 3/5',
                    value: '',
                    inputs: {
                        id: 'attack-pet-statue',
                        type: EMessageComponentType.RADIO,
                        component: {
                            label: 'Pet Statue',
                            value: 'pet-statue',
                            style: EButtonMessageStyle.PRIMARY,
                        },
                    },
                },
                {
                    name: 'Statue: 4/5',
                    value: '',
                    inputs: {
                        id: 'attack-statue',
                        type: EMessageComponentType.RADIO,
                        component: {
                            label: 'Statue',
                            value: 'statue',
                            style: EButtonMessageStyle.PRIMARY,
                        },
                    },
                },
                {
                    name: 'Vehicle: 5/5',
                    value: '',
                    inputs: {
                        id: 'attack-vehicle',
                        type: EMessageComponentType.RADIO,
                        component: {
                            label: 'Vehicle',
                            value: 'vehicle',
                            style: EButtonMessageStyle.PRIMARY,
                        },
                    },
                },
            ],
        };

        return {
            embed: [attackMessage],
            components: [attackButton],
        };
    };

    getSpinItems = (results: string[][]): string[] => {
        return results.map((reel) => {
            const lastImage = reel[reel.length - 1];

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
            const { spinImageUrl, spinPositionUrl } = this.miscService.getSpinImageResource();

            const expireTimer = setTimeout(() => {
                this.imService.forceClose(entryUser.mezon_id, this.name, '🌸 Chúc bạn chơi vui vẻ!');
            }, 3 * 60 * 1000);

            this.imService.register({
                mezonId: entryUser.mezon_id,
                message: repliedMessage,
                expireTimer: expireTimer,
                type: this.name,
            });

            this.mcService.getClient().onMessageButtonClicked(async (mbcEvent: MessageButtonClickedEvent) => {
                console.log(mbcEvent);
                if (mbcEvent.button_id === 'spin-cancel') {
                    this.imService.forceClose(entryUser.mezon_id, this.name, '🌸 Chúc bạn chơi vui vẻ!');
                    return;
                }
                const spinAmount = parseInt(mbcEvent.button_id.split('-')[1]);
                console.log('spinAmount: ', spinAmount);

                const spinResults = this.spin();

                await this.mcService.updateMessage(
                    repliedMessage,
                    this.getSpinMessage(spinImageUrl, spinPositionUrl, spinResults, entryUser.spin.spin_balance),
                );

                const spinReward = this.getSpinReward(this.getSpinItems(spinResults), entryUser.village.level);

                if (spinReward?.type === SPIN_ITEM_REWARD.ATTACK) {
                    await this.mcService.updateMessage(repliedMessage, this.getSelectTargetMessage('attack'));
                }

                if (spinReward?.type === SPIN_ITEM_REWARD.RAID) {
                    await this.mcService.updateMessage(repliedMessage, this.getSelectTargetMessage('raid'));
                }

                if (spinReward?.type === SPIN_ITEM_REWARD.SHIELD) {
                    const maxShield = 3;
                    let remainingShield = 0;
                    const totalShield = spinReward.amount * spinAmount;

                    if (totalShield + entryUser.village.shield > maxShield) {
                        remainingShield = totalShield + entryUser.village.shield - maxShield;
                    }

                    const spinCost = spinAmount - remainingShield;

                    await this.prisma.$transaction(async (tx) => {
                        this.villagesService.updateVillage(
                            tx,
                            { id: entryUser.village.id },
                            { shield: { increment: totalShield - remainingShield } },
                        );

                        if (spinCost > 0) {
                            this.spinsService.updateSpin(
                                tx,
                                { id: entryUser.spin.id },
                                { spin_balance: { decrement: spinCost } },
                            );
                        }
                    });
                }

                if (spinReward?.type === SPIN_ITEM_REWARD.ENERGY) {
                    this.spinsService.updateSpin(
                        this.prisma,
                        { id: entryUser.spin.id },
                        { spin_balance: { increment: spinReward.amount * spinAmount } },
                    );
                }

                if (spinReward?.type === SPIN_ITEM_REWARD.COIN) {
                    await this.prisma.$transaction(async (tx) => {
                        this.usersService.updateUser(
                            tx,
                            { id: entryUser.id },
                            { coin: { increment: spinReward.amount * spinAmount } },
                        );
                        this.spinsService.updateSpin(
                            tx,
                            { id: entryUser.spin.id },
                            { spin_balance: { decrement: spinAmount } },
                        );
                    });
                }
            });
        } catch (error) {
            console.error('❌ Lỗi khi thực hiện lệnh `spin`:', error);
            this.miscService.handleCommandError(ctx);
        }
    }
}
