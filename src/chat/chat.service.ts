// src/chat/chat.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class ChatService {
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private readonly logger = new Logger(ChatService.name);

  async getAIResponse(userMessage: string): Promise<string> {
    const systemPrompt = `
      You are a helpful AI assistant specialized in health information.
      Always remind users to consult a healthcare professional for medical advice.
      Provide clear, empathetic, and accurate answers.
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // use your preferred OpenAI model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 300,
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      throw error;
    }
  }
}
