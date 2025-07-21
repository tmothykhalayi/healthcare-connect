import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly modelName: string;
  private client: ReturnType<typeof ModelClient>;

  constructor(private configService: ConfigService) {
    this.endpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT') ?? '';
    this.apiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY') ?? '';
    this.modelName = this.configService.get<string>('AZURE_OPENAI_MODEL') ?? 'DeepSeek-R1';

    if (!this.endpoint || !this.apiKey || !this.modelName) {
      this.logger.error('Missing Azure OpenAI configuration');
      throw new Error('Missing Azure OpenAI config');
    }

    this.client = ModelClient(this.endpoint, new AzureKeyCredential(this.apiKey));
  }

  async getAIResponse(message: string): Promise<string> {
    try {
      const response = await this.client.path('/chat/completions').post({
        body: {
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: message }
          ],
          max_tokens: 2048,
          model: this.modelName
        }
      });

      if (response.status === '200') {
        // Success: response.body is ChatCompletionsOutput
        const body = response.body as any;
        return body.choices[0].message.content;
      } else {
        // Error: response.body is ErrorResponse
        const errorBody = response.body as any;
        this.logger.error('Azure AI Inference error:', errorBody?.error);
        throw new InternalServerErrorException(errorBody?.error?.message || 'Failed to get AI response');
      }
    } catch (err) {
      this.logger.error('Azure AI Inference SDK error:', err);
      throw new InternalServerErrorException('Failed to get AI response');
    }
  }
}
