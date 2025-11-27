import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import {
    ExampleCommandHandlers,
    ExampleComponentHandlers,
    ExampleDMHandlers,
    ExampleEmbedHandlers,
    ExampleMentionHandlers,
} from "./bot/commands";
import { ExampleEventHandlers } from "./bot/events";
import { NezonModule } from "@n0xgg04/nezon";
import { UsersService } from "@modules/users/users.service";
import { PrismaModule } from "./lib/prisma/prisma.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        NezonModule.forRoot({
            token: process.env.MEZON_TOKEN ?? "",
            botId: process.env.MEZON_BOT_ID ?? "",
        }),
        PrismaModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        UsersService,
        ExampleCommandHandlers,
        ExampleComponentHandlers,
        ExampleDMHandlers,
        ExampleEmbedHandlers,
        ExampleEventHandlers,
        ExampleMentionHandlers,
    ],
})
export class AppModule {}
