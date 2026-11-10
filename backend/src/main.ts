import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { configurarApp, configurarDocumentacao } from './configurar-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  configurarApp(app);
  configurarDocumentacao(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
