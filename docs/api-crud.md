# API CRUD documentada (E3)

Como o CRUD do Mutirão virou uma API REST de verdade: rotas coerentes, entrada validada por DTO, saída que não expõe a entidade, status corretos e contrato documentado. Entrega **E3** do portfólio, individual.

**Autor:** Marcos Gomes · **Projeto:** [Mutirão](../README.md). O CRUD foi feito em **3 recursos**: `pedidos`, `categorias` e `itens`. Os exemplos abaixo usam `pedidos` e `categorias`.

> O roteiro do professor usa obras e exemplares (BiblioCom). Aqui as mesmas regras foram aplicadas ao domínio do Mutirão.

| Item do checklist | Onde está |
| --- | --- |
| CRUD completo em 2+ recursos | `pedidos`, `categorias` e `itens` (5 rotas cada, mais `/status` e `/historico` em pedidos) |
| DTO de entrada (com whitelist) e de saída separados | [`pedido.dto.ts`](../backend/src/pedidos/pedido.dto.ts), [`categoria.dto.ts`](../backend/src/categorias/categoria.dto.ts), [`item.dto.ts`](../backend/src/itens/item.dto.ts) |
| Status 201, 204, 400, 404 e 409/422 | Seção 4 (curl comentado) |
| Paginação com teto (`@Max`) | `PaginacaoDto`: `pageSize` com `@Max(100)` |
| `/api/docs` com erros documentados e `openapi.json` atualizado | Seção 6 e [`backend/openapi.json`](../backend/openapi.json) |

---

## 1. Validação global: `whitelist` e `forbidNonWhitelisted`

Configurada em um lugar só, [`configurar-app.ts`](../backend/src/configurar-app.ts), e usada pela API e pelos testes e2e:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // remove campo não declarado no DTO
    forbidNonWhitelisted: true, // e responde 400 em vez de ignorar
    transform: true, // converte para a classe do DTO (query string vira número)
    exceptionFactory: erroDeValidacao, // { campo: ["mensagem"] }
  }),
);
```

**Por que `whitelist` e `forbidNonWhitelisted`:** sem eles, quem chama a API decide o valor de campos que o sistema nunca expôs. É o **mass assignment**: um `POST /api/categorias` com `{"nome":"Hack","tipo":"material","admin":true}` gravaria o `admin` se o objeto fosse repassado ao banco. Com `whitelist` o campo é removido; com `forbidNonWhitelisted` a API **recusa** com `400` (`{"admin":["Campo não permitido."]}`), e o cliente descobre o erro na integração, e não meses depois, quando percebe que o campo nunca chegou.

## 2. DTOs de entrada, de atualização e de saída

**DTO de entrada** (`class-validator`), com todas as regras do campo:

```ts
export class CriarCategoriaDto {
  @IsString() @Length(1, 80) nome: string;
  @IsEnum(TipoCategoria) tipo: TipoCategoria;
}
```

**DTO de atualização com `PartialType`:** o `PATCH` aceita só parte dos campos, mas as validações continuam valendo para os que vierem:

```ts
export class AtualizarCategoriaDto extends PartialType(CriarCategoriaDto) {}

// No pedido, a categoria e o autor não mudam depois de criado:
export class AtualizarPedidoDto extends PartialType(
  OmitType(CriarPedidoDto, ['autorId', 'categoriaId'] as const),
) {}
```

**DTO de entrada da query (paginação com teto):** a query string também é validada, e o tamanho de página tem teto:

```ts
export class PaginacaoDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize: number = 20;
}
```

**DTO de saída:** o service **devolve `PedidoResposta`**, desenhado para a resposta, e nunca a entidade. A entidade `Pedido` tem `autorId`, `categoriaId`, `localizacaoId` e outras colunas internas; a resposta traz o que o cliente precisa (o nome da categoria e do autor, e os itens com o nome do item):

```ts
static de(pedido: Pedido): PedidoResposta { /* monta só os campos do contrato */ }
```

---

## 3. Qual status para cada situação (E07.2)

| Situação | Status | Por quê |
| --- | :---: | --- |
| `POST /pedidos` com sucesso | **201** | Criou um recurso novo |
| `POST /pedidos` com título vazio | **400** | A entrada não respeita o DTO |
| `GET /pedidos/9999` inexistente | **404** | O recurso não existe |
| `DELETE /pedidos/6` com sucesso | **204** | Removeu, e não há corpo para devolver |
| `POST /itens` com nome repetido | **409** | Conflito com o estado atual (já existe um item com esse nome) |
| `PATCH /pedidos/5` sem estar autenticado | **401** | Respondido no papel: a API do Mutirão ainda é aberta; o login entra na Etapa 3 |
| `PATCH /pedidos/5/status` autenticado, mas sem permissão (um morador tentando analisar) | **403** | Sabemos quem é, mas ele não pode. Já funciona hoje por `responsavelId` (coberto no teste e2e "morador não analisa (403)") |
| Pedido alterado depois de sair de "solicitado" (regra de negócio) | **409** | A entrada é válida, mas a regra impede no estado atual |
| Erro inesperado no servidor | **500** | Corpo genérico; o detalhe vai para o log, nunca para a resposta |

**409 ou 422 ou 400, nos dois casos de regra de negócio?** O `400` diz "a *requisição* está mal formada" (JSON inválido, campo faltando, tipo errado), e o problema está **na entrada**. O `422` e o `409` dizem "a requisição está bem formada, mas a *regra do negócio* não deixa". Escolhi o **409** quando o pedido conflita com o **estado atual** do recurso (pedido que já saiu de "solicitado", item que já foi pedido, nome repetido), porque a mesma requisição seria aceita se o estado fosse outro. O `422` serviria para uma regra que não depende do estado atual. Já a **transição de status inválida** (por exemplo, "atendido" para "emAnalise") responde `400` com o erro no campo `status`, que o professor aceita como alternativa ao `422`.

**O `500` pode vazar informação?** Pode, se o erro não for tratado: um *stack trace* mostra caminhos de arquivo, versões e trechos de SQL, e isso ajuda quem ataca. Por isso o `500` devolve só uma mensagem genérica (`{"statusCode":500,"message":"Internal server error"}`, o padrão do NestJS para exceções não previstas), e o detalhe vai para o **log** do servidor. Os erros que **são** da regra de negócio (400, 403, 404, 409) passam pelo nosso filtro de exceções e devolvem mensagens claras, sem nada interno.

---

## 4. Curl comentado: 201, 204, 400, 404 e 409

Executado contra a API real (banco recém-criado pelas migrações e pelo seed). `HTTP` no fim de cada resposta é o status.

### Recurso 1: `categorias`

```text
### 201 criar
$ curl -X POST /api/categorias -H "Content-Type: application/json" -d '{"nome":"Mudas","tipo":"material"}'
{"id":8,"nome":"Mudas","tipo":"material"}
HTTP 201
```

```text
### 400 entrada inválida (nome vazio, tipo fora do enum): os dois campos aparecem, em português
$ curl -X POST /api/categorias -d '{"nome":"","tipo":"outro"}'
{"nome":["Não pode ficar vazio."],"tipo":["Valor inválido. Valores aceitos: material, servico, documento."]}
HTTP 400
```

```text
### 400 campo não declarado (whitelist + forbidNonWhitelisted): protege contra mass assignment
$ curl -X POST /api/categorias -d '{"nome":"Hack","tipo":"material","admin":true}'
{"admin":["Campo não permitido."]}
HTTP 400
```

```text
### 404 inexistente
$ curl -X GET /api/categorias/9999
{"detail":"Categoria não encontrada."}
HTTP 404
```

```text
### 409 nome repetido: o mesmo pedido de criação, agora em conflito com o estado
$ curl -X POST /api/categorias -d '{"nome":"Mudas","tipo":"material"}'
{"detail":"Já existe uma categoria com esse nome."}
HTTP 409
```

```text
### 200 alterar parcialmente: PATCH com PartialType, só o nome
$ curl -X PATCH /api/categorias/8 -d '{"nome":"Mudas de fruteiras"}'
{"id":8,"nome":"Mudas de fruteiras","tipo":"material"}
HTTP 200
```

```text
### 204 remover: sem corpo
$ curl -X DELETE /api/categorias/8
HTTP 204

### 404 depois de remover
$ curl -X GET /api/categorias/8
{"detail":"Categoria não encontrada."}
HTTP 404
```

### Recurso 2: `pedidos`

```text
### 201 criar pedido de material (com itens)
$ curl -X POST /api/pedidos -d '{"autorId":2,"categoriaId":2,"titulo":"Adubo para a roca","itens":[{"itemId":3,"quantidade":10}]}'
{"id":5,"categoria":{"id":2,"nome":"Adubo","tipo":"material"},"titulo":"Adubo para a roca",...,"itens":[{"item":{"id":3,"nome":"Adubo orgânico"},"quantidade":10,"unidade":"saco"}],...}
HTTP 201
```

A resposta é o `PedidoResposta` (nome da categoria, itens com nome), e não a entidade.

```text
### 400 regra do tipo de pedido: material exige itens
$ curl -X POST /api/pedidos -d '{"autorId":2,"categoriaId":2,"titulo":"Sem itens"}'
{"itens":["Informe ao menos um item para pedidos de material."]}
HTTP 400

### 400 validação aninhada: o erro aponta o caminho do campo
$ curl -X POST /api/pedidos -d '{"autorId":2,"categoriaId":2,"titulo":"x","itens":[{"itemId":3,"quantidade":-2}]}'
{"itens.0.quantidade":["Deve ser maior que zero."]}
HTTP 400
```

```text
### 404 inexistente
$ curl -X GET /api/pedidos/9999
{"detail":"Pedido não encontrado."}
HTTP 404
```

```text
### 200 listagem paginada, e 400 acima do teto de tamanho (@Max(100))
$ curl -X GET "/api/pedidos?pageSize=1"
{"count":5,"page":1,"pageSize":1,"totalPages":5,"results":[...]}
HTTP 200

$ curl -X GET "/api/pedidos?pageSize=100000"
{"pageSize":["Deve ser no máximo 100."]}
HTTP 400
```

```text
### 200 mudar o status, e depois 409: o pedido saiu de "solicitado", então não pode mais ser alterado nem apagado
$ curl -X PATCH /api/pedidos/5/status -d '{"status":"emAnalise","responsavelId":1}'
HTTP 200

$ curl -X PATCH /api/pedidos/5 -d '{"titulo":"tarde demais"}'
{"detail":"O pedido só pode ser alterado ou apagado enquanto estiver \"solicitado\"."}
HTTP 409

$ curl -X DELETE /api/pedidos/5
{"detail":"O pedido só pode ser alterado ou apagado enquanto estiver \"solicitado\"."}
HTTP 409

### 409 apagar categoria que já tem pedidos (RESTRICT no banco, tratado na API)
$ curl -X DELETE /api/categorias/2
{"detail":"Não é possível apagar uma categoria que já tem pedidos."}
HTTP 409
```

```text
### 204 apagar um pedido que ainda está "solicitado", e 404 depois
$ curl -X DELETE /api/pedidos/6
HTTP 204

$ curl -X GET /api/pedidos/6
{"detail":"Pedido não encontrado."}
HTTP 404
```

---

## 5. O contrato como verificação (E07.8)

O contrato OpenAPI é gerado **a partir do código** e fica versionado em [`backend/openapi.json`](../backend/openapi.json):

```bash
npm run gerar:schema -w backend   # precisa do banco no ar
```

**O `git diff` pega mudanças no contrato.** Teste: mudei o teto da paginação de 100 para 50 em `paginacao.ts`, regerei o contrato e vi o diff (três parâmetros `pageSize`, um por listagem):

```diff
-              "maximum": 100,
+              "maximum": 50,
```

Ao desfazer a mudança e gerar de novo, o `git diff` ficou vazio: o arquivo commitado volta a ser igual ao gerado.

**O passo de CI que falha quando o `openapi.json` commitado diverge do gerado** (escrito aqui; o CI do projeto entra na Etapa 3):

```yaml
- name: Verificar o contrato OpenAPI
  run: |
    npm run migration:run -w backend      # o schema é gerado com a aplicação conectada ao banco
    npm run gerar:schema -w backend
    git diff --exit-code backend/openapi.json   # falha (código 1) se o gerado diferir do commitado
  env:
    DATABASE_URL: postgres://mutirao:devpassword@localhost:5432/mutirao
```

Com um serviço `postgres:16` no job. Se alguém muda um DTO e esquece de regerar o `openapi.json`, o CI vermelho avisa; e quando o arquivo é commitado junto, o diff do PR mostra exatamente o que mudou para quem consome a API.

---

## 6. Swagger (`/api/docs`) com os erros documentados

Em `http://localhost:3000/api/docs` (e no [`openapi.json`](../backend/openapi.json)) cada rota documenta, além do sucesso, os erros que ela pode devolver, com `@ApiBadRequestResponse`, `@ApiNotFoundResponse`, `@ApiConflictResponse` e `@ApiForbiddenResponse`. O formato dos erros está descrito na descrição da API: `400` devolve `{ "campo": ["mensagem"] }` e os demais devolvem `{ "detail": "mensagem" }`.

Respostas documentadas por rota (extraído do `openapi.json`):

| Rota | Respostas documentadas |
| --- | --- |
| `GET /api/categorias` | 200 · 400 |
| `POST /api/categorias` | 201 · 400 · 409 |
| `GET /api/categorias/{id}` | 200 · 400 · 404 |
| `PATCH /api/categorias/{id}` | 200 · 400 · 404 · 409 |
| `DELETE /api/categorias/{id}` | 204 · 400 · 404 · 409 |
| `GET /api/itens` | 200 · 400 |
| `POST /api/itens` | 201 · 400 · 409 |
| `GET /api/itens/{id}` | 200 · 400 · 404 |
| `PATCH /api/itens/{id}` | 200 · 400 · 404 · 409 |
| `DELETE /api/itens/{id}` | 204 · 400 · 404 · 409 |
| `GET /api/pedidos` | 200 · 400 |
| `POST /api/pedidos` | 201 · 400 |
| `GET /api/pedidos/{id}` | 200 · 400 · 404 |
| `PATCH /api/pedidos/{id}` | 200 · 400 · 404 · 409 |
| `DELETE /api/pedidos/{id}` | 204 · 400 · 404 · 409 |
| `PATCH /api/pedidos/{id}/status` | 200 · 400 · 403 · 404 |
| `GET /api/pedidos/{id}/historico` | 200 · 400 · 404 |

(O `400` nas rotas com `{id}` é o do `ParseIntPipe`, quando o id não é um número inteiro.)

---

## Checklist

- [x] CRUD completo em 2+ recursos (pedidos, categorias e itens)
- [x] DTO de entrada (com `whitelist`) e DTO de saída separados: a entidade nunca sai na resposta
- [x] Status 201, 204, 400, 404 e 409 nos casos certos (seção 4)
- [x] Paginação com teto (`@Max(100)`)
- [x] `/api/docs` com os erros documentados e `openapi.json` atualizado e versionado
