import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  try {
    dotenv.config(); // ✅ load .env

    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error('❌ Error starting the application:', error);
    process.exit(1);
  }
}
bootstrap();
