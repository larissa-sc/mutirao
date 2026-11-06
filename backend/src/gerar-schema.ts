import { writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configurarApp } from './configurar-app.js';
import { montarDocumento } from './swagger.js';

async function gerarSchema(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });

  try {
    configurarApp(app);
    writeFileSync(
      './openapi.json',
      JSON.stringify(montarDocumento(app), null, 2),
    );
    console.log('openapi.json gerado');
  } finally {
    await app.close();
  }
}

await gerarSchema();
