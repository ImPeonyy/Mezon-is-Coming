import { Injectable } from '@nestjs/common';
import { MezonClient } from 'mezon-sdk';

@Injectable()
export class AppService {
    async onModuleInit() {
        this.botLogin();
    }

    async botLogin() {
        const client = new MezonClient({
            token: process.env.MEZON_BOT_TOKEN as string,
            botId: process.env.MEZON_BOT_ID as string,
        });

        await client.login().then(() => {
            console.log('Bot Started!');
        }).catch((error) => {
            console.error('Error Bot Logged in', error);
        });
    }
}
