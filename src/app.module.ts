import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { ListenersModule } from '@bots/listeners/listeners.module';
import { MezonClientModule } from '@/lib/mezon-client/mezon-client.module';
import { PrismaModule } from '@/lib/prisma/prisma.module';
import { MiscModule } from '@/modules/misc/misc.module';
import { InteractiveMessageModule } from '@/lib/interactive-message/interactive-message.module';
import { AsyncMutexModule } from '@/lib/async-mutex/async-mutex.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MezonClientModule,
        PrismaModule,
        MiscModule,
        InteractiveMessageModule,
        AsyncMutexModule,
        ListenersModule,
    ],
    providers: [AppService],
})
export class AppModule {}
