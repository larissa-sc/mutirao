import { describe, expect, it } from 'vitest';
import { validarEnv } from './esquema-env.js';

describe('validarEnv', () => {
  it('applies defaults while allowing the database to remain unconfigured', () => {
    expect(validarEnv({})).toMatchObject({
      PORT: 3000,
      DB_SSL: 'false',
      DB_SYNC: 'false',
    });
  });

  it('rejects an invalid port or database URL', () => {
    expect(() => validarEnv({ PORT: 'not-a-port' })).toThrow(
      'Variáveis de ambiente inválidas',
    );
    expect(() => validarEnv({ DATABASE_URL: 'not-a-url' })).toThrow(
      'Variáveis de ambiente inválidas',
    );
    expect(() => validarEnv({ DATABASE_URL: 'mysql://db.example' })).toThrow(
      'Variáveis de ambiente inválidas',
    );
  });
});
