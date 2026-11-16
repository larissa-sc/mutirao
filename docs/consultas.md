# Caderno de consultas e N+1 (E2)

Consultas escritas com o `Repository` do TypeORM sobre o banco do Mutirão, com o SQL que o TypeORM gera e a medição do problema N+1. Entrega **E2** do portfólio, individual.

**Autor:** Marcos Gomes · **Projeto:** [Mutirão](../README.md) (pedidos de material, serviço de máquina e declaração à Associação).

> Os exemplos do roteiro do professor usam obras e autores (BiblioCom). Aqui as mesmas consultas foram adaptadas ao domínio do Mutirão (pedidos, usuários e itens), usando as entidades e migrações das Atividades 1 e 2.

## Ambiente

| Item | Valor |
| --- | --- |
| Banco | PostgreSQL 16 em Docker, banco `mutirao_estudo` (separado do de desenvolvimento) |
| Criação | Só por migração (`npm run migration:run`); `synchronize: false` |
| Volume | 304 pedidos (4 do seed + 300 de carga), 77 sem descrição, datas de 1 a 300 dias atrás e status variados |
| Código das consultas | [`backend/src/estudo/consultas.ts`](../backend/src/estudo/consultas.ts) |
| SQL | Impresso por um logger que registra cada consulta (TypeORM `logQuery`) |

Como reproduzir (na pasta `backend`, com o Docker no ar):

```bash
DATABASE_URL=postgres://mutirao:devpassword@localhost:5433/mutirao_estudo node --no-warnings --loader ts-node/esm src/estudo/consultas.ts
```

Nos SQL abaixo, a longa lista de colunas do `SELECT` foi abreviada como `<colunas>`; todo o resto está como o terminal mostrou. Os valores **nunca** vão colados no texto da consulta: o TypeORM envia o SQL com `$1`, `$2` e os valores à parte (o que aparece entre colchetes).

---

## 1. Listagem paginada com `findAndCount` e teto de tamanho

```ts
const pagina = 2;
const tamanho = Math.min(20, 100); // teto de tamanho: nunca passa de 100
const [lista, total] = await pedidos.findAndCount({
  order: { id: 'ASC' },
  skip: (pagina - 1) * tamanho,
  take: tamanho,
});
```

```sql
SELECT <colunas> FROM "pedidos" "Pedido" ORDER BY "Pedido"."id" ASC LIMIT 20 OFFSET 20 []
SELECT COUNT(1) AS "cnt" FROM "pedidos" "Pedido" []
```

Resultado: 20 pedidos na página, 304 no total. O `findAndCount` dispara **2 consultas**: uma pelos dados (`skip` vira `OFFSET`, `take` vira `LIMIT`) e outra pela contagem total. O teto de 100 também vale na API (`?pageSize=`, validado com `@Max(100)`; `?pageSize=1000` responde `400`).

---

## 2. As 8 consultas com o Repository

### 2.1 Pedidos criados antes de uma data, ordenados por título

```ts
await pedidos.find({
  where: { dataCriacao: LessThan(new Date('2026-10-01')) },
  order: { titulo: 'ASC' },
});
```

```sql
SELECT <colunas> FROM "pedidos" "Pedido" WHERE (("Pedido"."dataCriacao" < $1)) ORDER BY "Pedido"."titulo" ASC [ 2026-10-01T00:00:00.000Z ]
```

254 pedidos. `LessThan` vira `<`, e `'ASC'` ordena do menor para o maior (de A a Z).

### 2.2 Título que contém "semente", sem diferenciar maiúsculas

```ts
await pedidos.find({ where: { titulo: ILike('%semente%') } });
```

```sql
SELECT <colunas> FROM "pedidos" "Pedido" WHERE (("Pedido"."titulo" ILIKE $1)) [ '%semente%' ]
```

31 pedidos. O `%` casa "qualquer coisa": nos dois lados significa "contém". O `I` de `ILIKE` ignora maiúsculas.

### 2.3 Pedidos de um usuário, com o autor carregado

```ts
await pedidos.find({
  where: { autorId: 2 },
  relations: { autor: true },
  take: 5,
});
```

```sql
SELECT DISTINCT "distinctAlias"."Pedido_id" AS "ids_Pedido_id" FROM (SELECT <colunas> FROM "pedidos" "Pedido" LEFT JOIN "usuarios" "Pedido__Pedido_autor" ON "Pedido__Pedido_autor"."id"="Pedido"."autorId" WHERE (("Pedido"."autorId" = $1))) "distinctAlias" ORDER BY "Pedido_id" ASC LIMIT 5 [ 2 ]
SELECT <colunas> FROM "pedidos" "Pedido" LEFT JOIN "usuarios" "Pedido__Pedido_autor" ON "Pedido__Pedido_autor"."id"="Pedido"."autorId" WHERE ( (("Pedido"."autorId" = $1)) ) AND ( "Pedido"."id" IN (1, 3, 6, 8, 10) ) [ 2 ]
```

`relations: { autor: true }` faz o TypeORM juntar a tabela de usuários (`LEFT JOIN`) na mesma consulta, sem consulta extra por pedido. Atenção: com `take` **e** `JOIN`, o TypeORM dispara **2** consultas (primeiro os ids da página, depois os dados desses ids), e não 1.

### 2.4 Pedidos negados ou cancelados

```ts
await pedidos.find({
  where: { status: In([StatusPedido.NEGADO, StatusPedido.CANCELADO]) },
});
```

```sql
SELECT <colunas> FROM "pedidos" "Pedido" WHERE (("Pedido"."status" IN ($1, $2))) [ 'negado', 'cancelado' ]
```

136 pedidos. `In([a, b])` vira `IN ($1, $2)`: o status é um ou outro.

### 2.5 Pedidos sem descrição

```ts
await pedidos.find({ where: { descricao: IsNull() } });
```

```sql
SELECT <colunas> FROM "pedidos" "Pedido" WHERE (("Pedido"."descricao" IS NULL)) []
```

77 pedidos. **Pegadinha:** vazio (`""`) e `NULL` são coisas diferentes. Aqui a coluna `descricao` é opcional (`nullable`) e guarda `NULL` quando ninguém preencheu, então o filtro certo é `IsNull()`. Se a coluna tivesse `default: ""`, o filtro seria `descricao: ''`. Em SQL, `= NULL` nunca é verdadeiro: só `IS NULL` funciona.

### 2.6 Os 10 pedidos mais recentes

```ts
await pedidos.find({ order: { dataCriacao: 'DESC' }, take: 10 });
```

```sql
SELECT <colunas> FROM "pedidos" "Pedido" ORDER BY "Pedido"."dataCriacao" DESC LIMIT 10 []
```

10 pedidos. `'DESC'` ordena do maior para o menor, então a data mais recente vem primeiro. `take` vira `LIMIT`.

### 2.7 Pedidos de autor cujo nome comece com "Maria"

```ts
await pedidos.find({
  where: { autor: { nome: ILike('Maria%') } },
  take: 5,
});
```

```sql
SELECT DISTINCT "distinctAlias"."Pedido_id" AS "ids_Pedido_id" FROM (SELECT <colunas> FROM "pedidos" "Pedido" LEFT JOIN "usuarios" "Pedido__Pedido_autor" ON "Pedido__Pedido_autor"."id"="Pedido"."autorId" WHERE (((("Pedido__Pedido_autor"."nome" ILIKE $1))))) "distinctAlias" ORDER BY "Pedido_id" ASC LIMIT 5 [ 'Maria%' ]
SELECT <colunas> FROM "pedidos" "Pedido" LEFT JOIN "usuarios" "Pedido__Pedido_autor" ON "Pedido__Pedido_autor"."id"="Pedido"."autorId" WHERE ( (((("Pedido__Pedido_autor"."nome" ILIKE $1)))) ) AND ( "Pedido"."id" IN (1, 3, 6, 8, 10) ) [ 'Maria%' ]
```

Filtro por **relação**: o TypeORM faz o `JOIN` sozinho. O `%` só no fim significa "**começa** com Maria". Sem `%` no início, o banco pode usar um índice na coluna `nome`; com `%` no início (`'%Maria'`) ele precisaria varrer a tabela inteira.

### 2.8 Total de pedidos (só a contagem)

```ts
await pedidos.count();
```

```sql
SELECT COUNT(1) AS "cnt" FROM "pedidos" "Pedido" []
```

304. Traz **uma** linha com o número, e não as 304 linhas (que seria `find()` seguido de `.length`).

---

## 3. Caçando o N+1

**Cenário:** um endpoint que lista N pedidos e, para cada um, mostra o autor, a categoria e os itens. Código em [`backend/src/diagnostico/diagnostico.service.ts`](../backend/src/diagnostico/diagnostico.service.ts). As rotas só existem com `DIAGNOSTICO=true` e não aparecem no Swagger.

**Versão ruim:** busca a lista e, **dentro de um laço**, faz uma consulta por pedido para cada relação:

```ts
const lista = await this.pedidos.find({ order: { id: 'ASC' }, take: tamanho });
for (const p of lista) {
  const autor = await this.usuarios.findOneByOrFail({ id: p.autorId });
  const categoria = await this.categorias.findOneByOrFail({ id: p.categoriaId });
  const linhas = await this.linhas.find({ where: { pedidoId: p.id }, relations: { item: true } });
  // ... monta a resposta
}
```

**Versão boa:** as relações vêm na própria consulta:

```ts
const lista = await this.pedidos.find({
  relations: { autor: true, categoria: true, itens: { item: true } },
  order: { id: 'ASC' },
  take: tamanho,
});
```

**Medição** (banco de estudo com 304 pedidos; três execuções de cada, tempo em milissegundos medido dentro do processo; as consultas são contadas pelo logger do TypeORM):

| Pedidos na lista | Versão | Consultas SQL | Tempo (3 execuções, ms) |
| --- | --- | --- | --- |
| 10 | Ruim | **31** | 71 · 58 · 61 |
| 10 | Boa | **2** | 24 · 9 · 5 |
| 50 | Ruim | **151** | 289 · 217 · 199 |
| 50 | Boa | **2** | 10 · 7 · 7 |
| 100 | Ruim | **301** | 352 · 362 · 348 |
| 100 | Boa | **2** | 13 · 9 · 12 |

| Versão | Consultas (para N pedidos) | Tempo (100 pedidos) | Linhas de código |
| --- | --- | --- | --- |
| Ruim | **1 + 3N** (31, 151, 301) | ≈ 350 ms | 27 |
| Boa | **2** (constante) | ≈ 10 ms | 10 |

A versão ruim faz **1 consulta para a lista + 3 por pedido** (autor, categoria e itens), e por isso cresce junto com N. A boa dispara um número fixo de consultas, e dá a mesma resposta. Com 100 pedidos, a ruim é cerca de **30 vezes mais lenta** e faz 150 vezes mais consultas. E aqui o banco roda na própria máquina: com o banco em outro servidor, cada consulta paga a latência da rede, e a diferença seria ainda maior.

### A versão ruim tem mais ou menos linhas de código? O que isso diz sobre achar N+1 em revisão?

Neste caso a versão ruim tem **mais** linhas (27 contra 10), porque escrevi o laço de propósito, todo num lugar só. Mas no dia a dia esse não é o jeito que o N+1 aparece. Ninguém o escreve por querer: ele surge quando alguém "só precisa do nome do autor" dentro de um `map` ou de um getter, muitas vezes em **outro arquivo**, e cada trecho isolado parece inocente. A versão ruim e a boa mostram o mesmo resultado na tela, com os mesmos dados.

A conclusão é que **o N+1 não se encontra lendo o código, se encontra contando o SQL**: com 10 pedidos a ruim é só um pouco mais lenta e passa despercebida; é com 100 ou 1.000 que ela explode. Por isso a régua é o **número de consultas por requisição**, medido no log (e idealmente em teste, com volume de dados), e não a leitura do TypeScript.

---

## 4. Nenhuma consulta concatena texto do usuário no SQL

Todas as consultas acima usam os operadores do `Repository` (`LessThan`, `ILike`, `In`, `IsNull`), que enviam o valor como **parâmetro** (`$1`, `$2`). Nas listagens da API (`/api/pedidos`, `/api/categorias`, `/api/itens`), que usam `QueryBuilder`, os filtros também usam parâmetros nomeados, e o texto do usuário nunca é colado na consulta:

```ts
consulta.andWhere('(p.titulo ILIKE :q OR p.descricao ILIKE :q)', { q: `%${filtros.q}%` });
```

O valor de `q` viaja separado do comando: o banco recebe o SQL e os parâmetros em campos distintos, então nunca interpreta o dado como SQL.

---

## Checklist

- [x] Listagem paginada com `findAndCount` e teto de tamanho (seção 1)
- [x] As 8 consultas do E06.1 com o SQL gerado de cada uma (seção 2)
- [x] N+1 reproduzido e corrigido, com nº de consultas e tempo antes e depois (seção 3)
- [x] Nenhuma consulta concatena texto do usuário no SQL (seção 4)
