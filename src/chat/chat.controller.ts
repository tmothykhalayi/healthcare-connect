import { Controller, Get, Post, Body } from '@nestjs/common';
import { chatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Public } from 'src/auth/decorators';
@Public()
@Controller('ai')
export class ChatController {
  constructor(private readonly chatService: chatService) {}

  @Post('/ava')
  async askAva(
    @Body()
    body: {
      message: string;
      role: 'doctor' | 'patient';
    },
  ) {
    const { message, role } = body;

    const reply = await this.chatService.askAva(message, role);
    return {
      success: true,
      assistant: 'Ava',
      data: { reply },
      timestamp: new Date().toISOString(),
    };
  }
}
