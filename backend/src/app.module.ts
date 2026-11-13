import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasModule } from './categorias/categorias.module.js';
import { ENTIDADES } from './database/entidades.js';
import { HealthController } from './health/health.controller.js';
import { ItensModule } from './itens/itens.module.js';
import { PedidosModule } from './pedidos/pedidos.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        // Sem DATABASE_URL a API não sobe: erro claro em vez de falha obscura.
        url: config.getOrThrow<string>('DATABASE_URL'),
        ssl:
          config.get('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        entities: ENTIDADES,
        // O banco só muda por migração (npm run migration:run).
        synchronize: false,
        migrations: ['dist/migracoes/*.js'],
      }),
    }),
    CategoriasModule,
    ItensModule,
    PedidosModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
