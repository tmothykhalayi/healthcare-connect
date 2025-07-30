import { Module } from '@nestjs/common';
import { chatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  controllers: [ChatController],
  providers: [chatService],
})
export class ChatModule {}
