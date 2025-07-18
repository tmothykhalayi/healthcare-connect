import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

@Injectable()
export class ChatService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(ChatService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
    let endpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT');
    const deploymentName = this.configService.get<string>('AI_MODEL');

    if (!apiKey || !endpoint || !deploymentName) {
      this.logger.error('Missing Azure OpenAI configuration');
      throw new Error('Missing Azure OpenAI config');
    }

    // Ensure endpoint ends with a slash as required by OpenAI client for Azure
    if (!endpoint.endsWith('/')) {
      endpoint += '/';
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: endpoint,
      // For Azure, you must specify the API type
      // Note: Depending on openai sdk version, this might be necessary:
      // azure: { deploymentName }
    });
  }

  async getAIResponse(message: string): Promise<string> {
    const deploymentName = this.configService.get<string>('AI_MODEL');

    if (!deploymentName) {
      this.logger.error('AI_MODEL is not defined in configuration');
      throw new Error('AI_MODEL is not defined');
    }

    try {
      // For Azure, use the 'model' property and set it to your deployment name
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // <-- Use deploymentName here for Azure
        messages: [{ role: 'user', content: message }],
      });

      const content = response.choices[0].message.content;
      if (content === null) {
        this.logger.error('OpenAI response content is null');
        throw new Error('OpenAI response content is null');
      }
      return content;
    } catch (error: any) {
      this.logger.error(`OpenAI API error: ${error.message || error}`);
      throw error;
    }
  }
}
