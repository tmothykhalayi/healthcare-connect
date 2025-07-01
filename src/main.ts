import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend integration
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Configure validation pipe with proper settings
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Healthcare Connect API')
    .setDescription('The Healthcare Connect API documentation')
    .setVersion('1.0')
    .addTag('users')
    .addTag('patients')
    .addTag('orders')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Get PORT 
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 3000;

  console.log(`Healthcare Connect API running on port ${PORT}`);
  await app.listen(PORT);
  console.log(`Healthcare Connect API running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api`);
}
bootstrap();
