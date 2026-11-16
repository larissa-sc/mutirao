import type { Logger } from 'typeorm';

// Logger do TypeORM que conta (e, se DB_LOGGING=true, imprime) cada SQL.
// É a "régua" do caderno de consultas: sem número, N+1 é só opinião.
// A contagem é global ao processo: meça com uma requisição por vez.
class ContadorDeConsultas implements Logger {
  consultas = 0;

  logQuery(query: string, parametros?: unknown[]): void {
    this.consultas++;
    if (process.env.DB_LOGGING === 'true') {
      console.log(`[sql #${this.consultas}] ${query}`, parametros ?? '');
    }
  }

  logQueryError(erro: string | Error, query: string): void {
    console.error('[sql erro]', erro, query);
  }

  logQuerySlow(): void {}
  logSchemaBuild(): void {}
  logMigration(): void {}
  log(): void {}
}

export const contador = new ContadorDeConsultas();
