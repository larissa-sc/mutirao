import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTIDADES } from './entidades.js';

// O banco ainda será definido (candidato: Supabase/Postgres). Sem
// DATABASE_URL, a API sobe normalmente, sem conexão com banco.
const conexao = process.env.DATABASE_URL
  ? [
      TypeOrmModule.forRoot({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl:
          process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        entities: ENTIDADES,
        // Somente em desenvolvimento: cria as tabelas a partir das entidades.
        synchronize: process.env.DB_SYNC === 'true',
      }),
    ]
  : [];

@Module({ imports: conexao })
export class DatabaseModule {}
