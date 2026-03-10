import { Injectable } from '@nestjs/common';
import { BotCommand, CommandContext } from '../command.interface';
import { MezonClientService } from '@/lib/mezon-client/mezon-client.service';
import { UsersService } from '@/modules/users/users.service';
import { MiscService } from '@/modules/misc/misc.service';
import { getEmbedMessage, getRandomPastelHexColor } from '@/utils';
import { BuildingType } from '@generated/prisma/client';

@Injectable()
export class ProfileCommand implements BotCommand {
    name = 'profile';
    isPublic = false;

    constructor(
        private readonly mezonClientService: MezonClientService,
        private readonly miscService: MiscService,
        private readonly usersService: UsersService,
    ) {}

    async execute(ctx: CommandContext) {
        const { repliedMessage, entryUser } = ctx;
        try {
            const user = await this.usersService.getProfileUser({ id: entryUser.id });
            
            const embedMessage = getEmbedMessage({
                color: getRandomPastelHexColor(),
                title: `🌸 Thông tin của ${user.username} 🌸`,
                description: `Invite Code: ${user.invite_code}`,
                thumbnail: {
                    url: user.avatar,
                },
                fields: [
                    {
                        name: '💰 Coin',
                        value: `${user.coin} coin`,
                        inline: true,
                    },
                    {
                        name: '💰 Token Balance',
                        value: `${user.mezon_token_balance}₫`,
                        inline: true,
                    },
                    {
                        name: '💰 Total Token',
                        value: `${user.total_mezon_token}₫`,
                        inline: true,
                    },

                    {
                        name: 'Spin Balance',
                        value: `${user.spin.spin_balance} spin`,
                        inline: true,
                    },
                    {
                        name: 'Village Level',
                        value: `${user.village.level}`,
                        inline: true,
                    },
                    {
                        name: 'Shield',
                        value: `${user.village.shield}/3`,
                        inline: true,
                    },

                    {
                        name: 'Tower Level',
                        value: `${user.village.buildings.find(building => building.type === BuildingType.TOWER)?.level}/5`,
                        inline: true,
                    },
                    {
                        name: 'Farm Level',
                        value: `${user.village.buildings.find(building => building.type === BuildingType.FARM)?.level}/5`,
                        inline: true,
                    },
                    {
                        name: 'Vehicle Level',
                        value: `${user.village.buildings.find(building => building.type === BuildingType.VEHICLE)?.level}/5`,
                        inline: true,
                    },
                    {
                        name: 'Pet Statue Level',
                        value: `${user.village.buildings.find(building => building.type === BuildingType.PET_STATUE)?.level}/5`,
                        inline: true,
                    },
                    {
                        name: 'Statue Level',
                        value: `${user.village.buildings.find(building => building.type === BuildingType.STATUE)?.level}/5`,
                        inline: true,
                    },
                ],
                footer: {
                    text: `🌸 Peonyy~`,
                },
            });

            await this.mezonClientService.updateMessage(repliedMessage, embedMessage);
        } catch (error) {
            console.error('❌ Lỗi khi thực hiện lệnh `profile`:', error);
            await this.miscService.handleCommandError(ctx);
        }
    }
}
