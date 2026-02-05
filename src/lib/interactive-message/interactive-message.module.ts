import { Global, Module } from '@nestjs/common';
import { InteractiveMessageService } from './interactive-message.service';

@Global()
@Module({
    providers: [InteractiveMessageService],
    exports: [InteractiveMessageService],
})
export class InteractiveMessageModule {}
