/**
 * Gera o contrato OpenAPI (backend/openapi.json) a partir do código.
 *
 *     npm run gerar:schema -w backend
 *
 * O arquivo é versionado no Git: quando uma mudança no código altera o
 * contrato, o `git diff` do openapi.json mostra exatamente o quê. Precisa do
 * banco no ar (a aplicação conecta ao subir).
 */
import { writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configurarApp, criarDocumento } from './configurar-app.js';

const app = await NestFactory.create(AppModule, { logger: false });
configurarApp(app);
await app.init();

const destino = new URL('../openapi.json', import.meta.url);
writeFileSync(destino, JSON.stringify(criarDocumento(app), null, 2) + '\n');
console.log('openapi.json gerado');

await app.close();
