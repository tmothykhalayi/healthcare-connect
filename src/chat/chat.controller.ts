// src/chat/chat.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto) {
    try {
      const reply = await this.chatService.getAIResponse(createChatDto.message);
      return { reply };
    } catch (error) {
      throw new HttpException(
        'Failed to get AI response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
