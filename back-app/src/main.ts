import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { configService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Define o prefixo global: /api
  app.setGlobalPrefix('api');

  // Habilita versionamento por URI: /api/v1/...
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Habilita CORS para facilitar testes locais
  app.enableCors();
  
  await app.listen(configService.getPort());
}
bootstrap();
