import type { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { montarDocumento } from './swagger.js';

export function configurarApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  SwaggerModule.setup('docs', app, montarDocumento(app), {
    useGlobalPrefix: true,
  });
}
