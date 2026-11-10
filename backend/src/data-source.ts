import 'dotenv/config';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';

// Este arquivo roda de dois jeitos: como .ts pela CLI (desenvolvimento) e como
// .js já compilado em dist/ (produção). Os caminhos acompanham.
const pasta = dirname(fileURLToPath(import.meta.url));
const ext = import.meta.url.endsWith('.ts') ? 'ts' : 'js';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [`${pasta}/**/*.entity.${ext}`],
  migrations: [`${pasta}/migracoes/*.${ext}`],
  synchronize: false,
});
