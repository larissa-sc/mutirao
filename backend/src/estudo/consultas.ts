/**
 * Estudo E2 / E06.1: cada consulta escrita com o Repository, mais o SQL que o
 * TypeORM gera. Cole o resultado (TypeScript + SQL) no docs/consultas.md.
 *
 * Rodar (banco de estudo, com 300+ pedidos):
 *   DATABASE_URL=postgres://mutirao:devpassword@localhost:5433/mutirao_estudo \
 *     node --no-warnings --loader ts-node/esm src/estudo/consultas.ts
 *
 * Complete as lacunas /* ??? * / de cada consulta (o resto já está montado).
 */
import { ILike, In, IsNull, LessThan } from 'typeorm';
import dataSource from '../data-source.js';
import { Pedido } from '../pedidos/pedido.entity.js';
import { StatusPedido } from '../pedidos/status-pedido.enum.js';

// Em vez de ligar o logging do banco inteiro, imprimimos o SQL de cada consulta.
function ligarLogDeSql() {
  dataSource.logger = {
    logQuery: (consulta: string, parametros?: unknown[]) =>
      console.log(`   SQL: ${consulta.replace(/\s+/g, ' ')}`, parametros ?? ''),
    logQueryError: (erro: string | Error) => console.error('   ERRO:', erro),
    logQuerySlow() {},
    logSchemaBuild() {},
    logMigration() {},
    log() {},
  };
}

function titulo(texto: string) {
  console.log(`\n=== ${texto}`);
}

async function main() {
  await dataSource.initialize();
  ligarLogDeSql();
  const pedidos = dataSource.getRepository(Pedido);

  // Exemplo resolvido, para você ver o formato (consulta 8 do professor):
  titulo(
    '8) Total de pedidos cadastrados (só a contagem, sem trazer as linhas)',
  );
  const total = await pedidos.count();
  console.log(`   resultado: ${total}`);

  // ---------------------------------------------------------------------
  // SUA VEZ: troque cada /* ??? */ e rode. Leia o SQL de cada uma.
  // ---------------------------------------------------------------------

  titulo('1) Pedidos criados antes de uma data, ordenados por título');
  // Dica: LessThan(uma Date). Ordem crescente = 'ASC'.
  const c1 = await pedidos.find({
    where: { dataCriacao: LessThan(new Date('2026-10-01')) },
    order: { titulo: 'ASC' },
  });
  console.log(`   resultado: ${c1.length} pedidos`);

  titulo('2) Pedidos cujo título contém "semente", sem diferenciar maiúsculas');
  // Dica: ILike = LIKE sem diferenciar maiúsculas. Para "contém", onde ficam os %?
  const c2 = await pedidos.find({
    where: { titulo: ILike('%semente%') },
  });
  console.log(`   resultado: ${c2.length} pedidos`);

  titulo('3) Pedidos de um usuário (autorId 2), com o autor carregado');
  // Dica: o filtro é por coluna; "autor carregado" é a opção relations.
  const c3 = await pedidos.find({
    where: { autorId: 2 },
    relations: { autor: true },
    take: 5,
  });
  console.log(
    `   resultado: ${c3.length} pedidos (take 5), autor: ${c3[0]?.autor?.nome}`,
  );

  titulo('4) Pedidos negados ou cancelados');
  // Dica: In([a, b]) ou um array de condições em where. Use o enum StatusPedido.
  const c4 = await pedidos.find({
    where: { status: In([StatusPedido.NEGADO, StatusPedido.CANCELADO]) },
  });
  console.log(`   resultado: ${c4.length} pedidos`);

  titulo('5) Pedidos sem descrição');
  // Dica do professor: ausência pode ser NULL ou "" (vazio). Qual é o seu caso?
  // Aqui a coluna é nullable e o seed grava NULL. Use IsNull().
  const c5 = await pedidos.find({
    where: { descricao: IsNull() },
  });
  console.log(`   resultado: ${c5.length} pedidos`);

  titulo('6) Os 10 pedidos mais recentes');
  // Dica: mais recentes = data decrescente ('DESC'); "só 10" = take.
  const c6 = await pedidos.find({
    order: { dataCriacao: 'DESC' },
    take: 10,
  });
  console.log(`   resultado: ${c6.length} pedidos`);

  titulo('7) Pedidos de autor cujo nome comece com "Maria"');
  // Dica do professor: filtro por relação: where: { autor: { nome: ILike("...%") } }.
  // Sem % no início, o índice pode ser usado.
  const c7 = await pedidos.find({
    where: { autor: { nome: ILike('Maria%') } },
    take: 5,
  });
  console.log(`   resultado: ${c7.length} pedidos (take 5)`);

  titulo(
    '9) Listagem paginada com findAndCount (página 2, 20 por página, teto de 100)',
  );
  // findAndCount devolve [linhas, total] e dispara 2 consultas: os dados e a contagem.
  const pagina = 2;
  const tamanho = Math.min(20, 100); // teto de tamanho: nunca passa de 100
  const [lista9, total9] = await pedidos.findAndCount({
    order: { id: 'ASC' },
    skip: (pagina - 1) * tamanho,
    take: tamanho,
  });
  console.log(
    `   resultado: ${lista9.length} pedidos nesta página, ${total9} no total`,
  );

  await dataSource.destroy();
}

await main();
