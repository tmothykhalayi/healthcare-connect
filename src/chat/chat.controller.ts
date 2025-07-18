import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

class ChatResponseDto {
  reply: string;
}

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message to AI and get the response' })
  @ApiBody({ type: CreateChatDto })
  @ApiResponse({
    status: 201,
    description: 'AI reply',
    type: ChatResponseDto,
  })
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
