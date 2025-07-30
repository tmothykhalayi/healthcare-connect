import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {ValidationPipe,Catch,ExceptionFilter,ArgumentsHost,HttpException,HttpStatus,} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LogsService } from './logs/logs.service';
import helmet from 'helmet';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// Global Exception Filter with LogsService
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapter: any,
    private readonly logsService: LogsService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // If message is an object with 'message' property (like validation errors), extract it
    if (
      typeof message === 'object' &&
      message !== null &&
      'message' in message
    ) {
      message = message.message;
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      // Optionally include the full exception for debugging
      error: exception,
    };

    // Log exception (full object)
    this.logsService.error(
      `Error on ${request.method} ${request.url}`,
      JSON.stringify({ status, message, exception }),
    );

    this.httpAdapter.reply(response, responseBody, status);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Enable CORS for frontend integration
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const httpAdapter = app.getHttpAdapter();
  const logsService = app.get(LogsService);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, logsService));

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 8000;
  app.setGlobalPrefix('api');

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Healthcare Connect API')
    .setDescription('The Healthcare Connect API documentation')
    .setVersion('1.0')
    .addTag('users')
    // .addTag('patients') // Removed to prevent duplicate
    .addTag('orders')
    .addBearerAuth()
    .addServer(`http://localhost:${PORT}`, 'Development Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Healthcare Connect API Docs',
  });

  await app.listen(PORT);
  console.log(` Healthcare Connect API running on http://localhost:${PORT}`);
  console.log(` Swagger docs available at http://localhost:${PORT}/api`);
}

bootstrap();
