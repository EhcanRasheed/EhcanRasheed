import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  try {
    dotenv.config(); // ✅ load .env

    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔧 PORT:', process.env.PORT);
    console.log('🔧 DATABASE_URL present:', !!process.env.DATABASE_URL);

    const app = await NestFactory.create(AppModule);

    const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:5173', 'http://localhost:5174'];
    app.enableCors({
      origin: allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Application is running on port ${port}`);
  } catch (error) {
    console.error('❌ Error starting the application:', error.message || error);
    console.error(error.stack);
    process.exit(1);
  }
}
bootstrap();
