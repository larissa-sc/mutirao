import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  erroDeValidacao,
  FiltroDeExcecoes,
} from './common/filtro-de-excecoes.js';

// Configuração comum da aplicação: usada pelo main.ts e pelos testes e2e,
// para os dois enxergarem a mesma API.
export function configurarApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new FiltroDeExcecoes());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campo não declarado (mass assignment)
      forbidNonWhitelisted: true, // e responde 400 em vez de ignorar
      transform: true, // converte para a classe do DTO
      exceptionFactory: erroDeValidacao, // { campo: ["mensagem"] }
    }),
  );
}

// Swagger em /api/docs e o schema em /api/openapi.json.
export function configurarDocumentacao(app: INestApplication): void {
  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Mutirão')
      .setDescription(
        'Pedidos de material, serviço de máquina e declaração à Associação dos Moradores e Agricultores Familiares da Vila Nova de Cana Brava.',
      )
      .setVersion('0.1.0')
      .build(),
  );
  SwaggerModule.setup('api/docs', app, documento, {
    jsonDocumentUrl: 'api/openapi.json',
  });
}
