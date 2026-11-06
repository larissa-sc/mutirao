import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function montarDocumento(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Mutirão API')
    .setDescription('Contrato HTTP dos endpoints implementados do Mutirão.')
    .setVersion('1.0')
    .build();

  return SwaggerModule.createDocument(app, config);
}
