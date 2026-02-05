import { Global, Module } from '@nestjs/common';
import { MezonClientService } from './mezon-client.service';
import { UsersModule } from '@/modules/users/users.module';

@Global()
@Module({
    imports: [UsersModule],
    providers: [MezonClientService],
    exports: [MezonClientService],
})
export class MezonClientModule {}
