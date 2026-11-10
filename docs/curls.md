# Guia de teste da API (curls)

Como subir o sistema, rodar os testes automatizados e testar a API na mão com `curl`, incluindo o roteiro de demonstração da Etapa 2 com o resultado esperado de cada passo.

- Documentação interativa (Swagger): http://localhost:3000/api/docs
- Contrato completo das rotas: [contrato-api.md](contrato-api.md)
- Modelo de dados: [dominio.md](dominio.md) e [`backend/ENTIDADES.md`](../backend/ENTIDADES.md)

> Os comandos abaixo usam a sintaxe do **Git Bash** (Linux/macOS também). No PowerShell, use `curl.exe` em vez de `curl` e mande o JSON por arquivo (`--data "@pedido.json"`), por causa das aspas.

---

## 1. Subir o sistema

Requisitos: Node 24 (npm 11) e Docker.

```bash
docker compose up -d                  # PostgreSQL 16 na porta 5433
cp backend/.env.example backend/.env  # DATABASE_URL já aponta para o Docker
npm install                           # na raiz do repositório
npm run migration:run -w backend      # cria as tabelas num banco vazio
npm run seed -w backend               # dados de exemplo
npm run dev:api                       # http://localhost:3000
```

Conferir que está no ar:

```bash
curl -s http://localhost:3000/api/health
```

Resposta esperada: `{"status":"ok","banco":"ok"}`.

### Começar do zero

Apaga o banco e recria tudo (os dados criados nos testes somem):

```bash
docker compose down -v
docker compose up -d
npm run migration:run -w backend
npm run seed -w backend
```

---

## 2. Dados do seed

Usados nos exemplos abaixo (os ids valem para um banco recém-criado).

**Usuários** (o login só entra na Etapa 3; por enquanto o id vai no corpo da requisição)

| id | Nome | Papel |
| --- | --- | --- |
| 1 | José Amaro | associação |
| 2 | Maria Silva | morador |
| 3 | João Santos | morador |

**Categorias**

| id | Nome | Tipo |
| --- | --- | --- |
| 1 | Sementes | material |
| 2 | Adubo | material |
| 3 | Ferramentas | material |
| 4 | Serviço de trator | servico |
| 5 | Serviço de patrol | servico |
| 6 | Declaração | documento |
| 7 | Outros | material |

**Itens do catálogo**

| id | Nome | Unidade |
| --- | --- | --- |
| 1 | Semente de milho | kg |
| 2 | Semente de feijão | kg |
| 3 | Adubo orgânico | saco |
| 4 | Adubo NPK | saco |
| 5 | Enxada | unidade |
| 6 | Foice | unidade |
| 7 | Carrinho de mão | unidade |

**Pedidos de exemplo**

| id | Autor | Tipo | Status |
| --- | --- | --- | --- |
| 1 | Maria | material (sementes) | solicitado |
| 2 | João | serviço (patrol) | encaminhado |
| 3 | Maria | declaração | atendido |
| 4 | João | material (enxadas) | negado |

---

## 3. Testes automatizados

```bash
npm run test -w backend        # unitários (50), sem banco
npm run test:e2e -w backend    # ponta a ponta (7), exige docker compose up e migration:run
```

Os unitários cobrem as entidades e relações, as regras de status, as regras por tipo de pedido, a validação dos DTOs e a paginação. Os e2e passam pela API real e pelo PostgreSQL.

---

## 4. Roteiro de demonstração (Etapa 2)

Siga na ordem, com o banco recém-criado pelo seed. Cada passo mostra o status esperado.

### 4.1 Banco vazio → migrações → seed

Está na seção 1. O resultado esperado do `migration:run` é `Migration ... has been executed successfully`.

### 4.2 Listar

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/api/pedidos?pageSize=5"
```

Esperado: **200**, `count` 4, com a lista de pedidos do seed.

### 4.3 Criar um pedido de material

Guarda o id do pedido criado na variável `ID`.

```bash
ID=$(curl -s -X POST http://localhost:3000/api/pedidos -H "Content-Type: application/json" -d '{"autorId":2,"categoriaId":2,"titulo":"Adubo para a roca","itens":[{"itemId":3,"quantidade":10},{"itemId":4,"quantidade":5.5,"unidade":"saco"}]}' | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2); echo "pedido criado: $ID"
```

Esperado: um número (o id). O status HTTP é **201**; para ver a resposta completa:

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/api/pedidos/$ID
```

### 4.4 Entradas inválidas respondem 400

Material sem itens:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/pedidos -H "Content-Type: application/json" -d '{"autorId":2,"categoriaId":2,"titulo":"Material sem itens"}'
```

Esperado: **400** `{"itens":["Informe ao menos um item para pedidos de material."]}`.

Serviço sem localização:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/pedidos -H "Content-Type: application/json" -d '{"autorId":3,"categoriaId":4,"titulo":"Trator sem local"}'
```

Esperado: **400** `{"localizacao":["Informe a localização para pedidos de serviço de máquina."]}`.

Campo que não existe, título vazio e quantidade negativa:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/pedidos -H "Content-Type: application/json" -d '{"autorId":2,"categoriaId":2,"titulo":"","admin":true,"itens":[{"itemId":3,"quantidade":-2}]}'
```

Esperado: **400**, com mensagens em português nos três campos:

```json
{
  "admin": ["Campo não permitido."],
  "titulo": ["Não pode ficar vazio."],
  "itens.0.quantidade": ["Deve ser maior que zero."]
}
```

### 4.5 Status e permissões

O morador não analisa o pedido (403):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/pedidos/$ID/status -H "Content-Type: application/json" -d '{"status":"emAnalise","responsavelId":2}'
```

A Associação coloca em análise (200), aprova (200) e atende (200):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/pedidos/$ID/status -H "Content-Type: application/json" -d '{"status":"emAnalise","responsavelId":1}'
```

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/pedidos/$ID/status -H "Content-Type: application/json" -d '{"status":"aprovado","responsavelId":1,"observacao":"Adubo separado"}'
```

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/pedidos/$ID/status -H "Content-Type: application/json" -d '{"status":"atendido","responsavelId":1}'
```

Voltar de um estado final é inválido (400):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/pedidos/$ID/status -H "Content-Type: application/json" -d '{"status":"emAnalise","responsavelId":1}'
```

Esperado: **400** `{"status":["Não é possível mudar de \"atendido\" para \"emAnalise\"."]}`.

Histórico do pedido (200, com as 4 mudanças):

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/api/pedidos/$ID/historico
```

### 4.6 Alterar e apagar só enquanto "solicitado"

O pedido atendido não muda nem some (409):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/pedidos/$ID -H "Content-Type: application/json" -d '{"titulo":"tarde demais"}'
```

```bash
curl -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/pedidos/$ID
```

Um pedido novo, ainda "solicitado": altera (200), apaga (204) e depois não existe mais (404).

```bash
ID2=$(curl -s -X POST http://localhost:3000/api/pedidos -H "Content-Type: application/json" -d '{"autorId":2,"categoriaId":3,"titulo":"Foice para a roca","itens":[{"itemId":6,"quantidade":2}]}' | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2); echo "pedido criado: $ID2"
```

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/pedidos/$ID2 -H "Content-Type: application/json" -d '{"titulo":"Foices e enxadas","itens":[{"itemId":6,"quantidade":2},{"itemId":5,"quantidade":3}]}'
```

```bash
curl -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/pedidos/$ID2
```

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/api/pedidos/$ID2
```

### 4.7 Paginação com teto de tamanho

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/api/itens?page=1&pageSize=2"
```

Esperado: **200**, `page` 1, `pageSize` 2, `totalPages` 4 (7 itens).

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/api/itens?pageSize=1000"
```

Esperado: **400** `{"pageSize":["Deve ser no máximo 100."]}`.

---

## 5. Outros curls

### Consultas e filtros

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/api/pedidos?tipo=servico&status=encaminhado"
```

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/api/pedidos?autorId=2&ordering=dataCriacao"
```

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/api/pedidos?q=ramal"
```

A busca `q` olha o título e a descrição do pedido (aqui acha a rodagem do ramal do seed).

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/api/categorias?tipo=servico"
```

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/api/itens?q=adubo"
```

### Pedido de serviço de máquina (exige localização)

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/pedidos -H "Content-Type: application/json" -d '{"autorId":3,"categoriaId":5,"titulo":"Rodagem do ramal norte","descricao":"Trecho com buracos","localizacao":{"latitude":-8.12,"longitude":-34.98}}'
```

Encaminhar à Prefeitura (só serviço), depois de colocar em análise:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/pedidos/<id>/status -H "Content-Type: application/json" -d '{"status":"emAnalise","responsavelId":1}'
```

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/pedidos/<id>/status -H "Content-Type: application/json" -d '{"status":"encaminhado","responsavelId":1,"observacao":"Oficio enviado a Prefeitura"}'
```

Aprovar um serviço é inválido (400): serviço é encaminhado, não aprovado.

### Pedido de declaração (sem itens e sem localização)

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/pedidos -H "Content-Type: application/json" -d '{"autorId":2,"categoriaId":6,"titulo":"Declaracao de morador","descricao":"Para apresentar em banco"}'
```

### Negar exige o motivo

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/pedidos/<id>/status -H "Content-Type: application/json" -d '{"status":"negado","responsavelId":1}'
```

Esperado: **400** `{"observacao":["Informe o motivo ao negar um pedido."]}`. Com `"observacao":"Sem estoque neste mes"` passa (200).

### O morador cancela o próprio pedido

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/pedidos/<id>/status -H "Content-Type: application/json" -d '{"status":"cancelado","responsavelId":2}'
```

Só vale para o autor e enquanto o pedido está "solicitado" ou "emAnalise". Outro morador (`responsavelId` 3) recebe **403**.

### Categorias e itens (CRUD)

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/categorias -H "Content-Type: application/json" -d '{"nome":"Mudas","tipo":"material"}'
```

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/api/categorias/<id> -H "Content-Type: application/json" -d '{"nome":"Mudas de fruteiras"}'
```

```bash
curl -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/categorias/<id>
```

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/itens -H "Content-Type: application/json" -d '{"nome":"Pulverizador costal","unidadePadrao":"unidade"}'
```

Repetir o mesmo nome dá **409**. Apagar uma categoria que já tem pedidos (`DELETE /api/categorias/5`) ou um item que já foi pedido (`DELETE /api/itens/3`) também dá **409**.

---

## 6. Resumo dos status

| Status | Quando |
| --- | --- |
| 200 | Consulta, alteração e mudança de status |
| 201 | Criação |
| 204 | Remoção (sem corpo) |
| 400 | Campo inválido, regra do tipo de pedido, transição inválida, motivo ausente |
| 403 | Morador tentando algo que só a Associação pode |
| 404 | Pedido, categoria ou item que não existe |
| 409 | Nome repetido, pedido fora de "solicitado", categoria ou item em uso |
| 503 | `/api/health` sem conexão com o banco |

---

## 7. Problemas comuns

| Sintoma | Causa e solução |
| --- | --- |
| `Acesso negado` ao rodar `npm run test` ou `npm run build` no Windows | A máquina bloqueia os atalhos `.cmd` de `node_modules/.bin`. Chame o programa direto: `node ../node_modules/vitest/vitest.mjs run` (dentro de `backend`). Os scripts `migration:*` e `seed` já fazem isso |
| `connect ECONNREFUSED` ao subir a API | O banco não está no ar: `docker compose up -d` e espere ficar `healthy` (`docker compose ps`) |
| `relation "..." does not exist` | Faltou aplicar as migrações: `npm run migration:run -w backend` |
| Porta 5433 ou 3000 ocupada | Troque a porta do Docker em `docker-compose.yml` (e a `DATABASE_URL`), ou a `PORT` no `backend/.env` |
| Acentos estranhos no pedido criado pelo `curl` | O terminal do Windows envia o texto em outra codificação. Use texto sem acento nos exemplos, ou envie o JSON por arquivo em UTF-8 |
| Primeira execução dos testes estoura o tempo | O disco sincronizado com OneDrive é lento na primeira vez. Rode de novo, ou aumente o tempo: `--hookTimeout=120000` |
| `DATABASE_URL` ausente | Copie `backend/.env.example` para `backend/.env` |
