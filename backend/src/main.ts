import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Безопасность
  app.use(helmet());
  app.enableCors(); // Разрешаем CORS для фронтенда
  app.use(compression());
  

  // ✅ Глобальная валидация DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // ✅ Swagger Документация
  const config = new DocumentBuilder()
    .setTitle('Factory Orders API')
    .setDescription('Документация для заказов и загрузки файлов')
    .setVersion('1.0')
    .addTag('Orders')
    .addBearerAuth() // на будущее для JWT токенов
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // Документация доступна по /api-docs

  // ✅ Запуск
  await app.listen(3000);
  console.log(`🚀 Backend запущен: http://localhost:3000`);
  console.log(`📚 Swagger доступен по адресу: http://localhost:3000/api-docs`);
}
bootstrap();
