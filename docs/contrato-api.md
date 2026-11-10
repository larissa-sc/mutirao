# Contrato da API - Mutirão

## Objetivo

Este documento define o contrato da API do Mutirão: recursos, rotas, métodos HTTP, formatos de resposta, regras de acesso, paginação, filtros e formato dos erros. Ele foi **revisado contra a implementação** (Etapa 2): o que está aqui responde de fato assim, e os exemplos foram obtidos da API em execução.

A documentação interativa fica em **`/api/docs`** (Swagger) e o schema em **`/api/openapi.json`**.

> **Terminologia:** o termo oficial é **pedido**. Regras de negócio, atributos e transições estão em [dominio.md](dominio.md).

> ⚠️ **Autenticação (Etapa 3).** Nesta etapa a API ainda não exige login. Por isso `autorId` (ao criar um pedido) e `responsavelId` (ao mudar o status) são enviados no corpo. Quando o login entrar, esses campos passam a vir do usuário autenticado, e as permissões por papel e por dono do recurso passam a ser aplicadas em cada rota. A coluna "Quem pode" abaixo já descreve o comportamento final.

## As decisões do contrato

| | Decisão |
| --- | --- |
| Prefixo e versão | `/api` (sem versionamento na Etapa 2) |
| Barra final nas rotas | NÃO |
| Nomes dos campos | `camelCase` |
| Datas | ISO 8601 em UTC para data/hora (`2026-09-29T10:30:00Z`) e `AAAA-MM-DD` para `dataDesejada` |
| Valores monetários | Não se aplica |
| Paginação | `{ count, page, pageSize, totalPages, results }`; `?page=` (começa em 1) e `?pageSize=` (padrão 20, **máximo 100**) |
| Filtros, busca e ordenação | Query string: `?q=`, `?ordering=` e filtros por campo (ver cada recurso) |
| Validação | `400` com `{ "campo": ["mensagem", ...] }`, em português. Campos aninhados usam o caminho (`itens.0.quantidade`). Campo não declarado também é recusado |
| Demais erros | `{ "detail": "mensagem" }`: `401` não autenticado, `403` sem permissão, `404` não encontrado, `409` conflito |
| Relações | Aninhadas na leitura (`categoria`, `autor`, `itens`, `localizacao`); na escrita, por id (`categoriaId`, `itemId`) |

## Tabela de recursos

Legenda de "Quem pode" (comportamento final, com login): **Qualquer** = qualquer usuário autenticado · **Morador\*** = apenas o autor do pedido · **Associação** = membro da Associação.

| Recurso | Método | Rota | O que faz | Sucesso | Quem pode |
| --- | --- | --- | --- | --- | --- |
| Pedido | GET | `/api/pedidos` | Lista (paginada, com filtros) | 200 | Morador (só os seus) · Associação (todos) |
| | POST | `/api/pedidos` | Cria pedido | 201 | Morador · Associação |
| | GET | `/api/pedidos/{id}` | Consulta | 200 | Morador\* · Associação |
| | PATCH | `/api/pedidos/{id}` | Altera título, descrição, data, localização ou itens (só se `solicitado`) | 200 | Morador\* |
| | DELETE | `/api/pedidos/{id}` | Apaga (só se `solicitado`) | 204 | Morador\* |
| | PATCH | `/api/pedidos/{id}/status` | Altera o status | 200 | Associação · Morador\* (só `cancelado`) |
| | GET | `/api/pedidos/{id}/historico` | Histórico de status | 200 | Morador\* · Associação |
| Categoria | GET | `/api/categorias` | Lista (paginada) | 200 | Qualquer |
| | GET | `/api/categorias/{id}` | Consulta | 200 | Qualquer |
| | POST | `/api/categorias` | Cria | 201 | Associação |
| | PATCH | `/api/categorias/{id}` | Altera | 200 | Associação |
| | DELETE | `/api/categorias/{id}` | Apaga (se sem pedidos) | 204 | Associação |
| Item | GET | `/api/itens` | Lista o catálogo (paginada) | 200 | Qualquer |
| | GET | `/api/itens/{id}` | Consulta | 200 | Qualquer |
| | POST | `/api/itens` | Cria | 201 | Associação |
| | PATCH | `/api/itens/{id}` | Altera | 200 | Associação |
| | DELETE | `/api/itens/{id}` | Apaga (se nunca pedido) | 204 | Associação |
| Saúde | GET | `/api/health` | API e banco no ar | 200 (503 sem banco) | Público |

## Filtros por recurso

| Recurso | Parâmetros |
| --- | --- |
| `/api/pedidos` | `status`, `categoriaId`, `tipo` (`material`, `servico`, `documento`), `autorId`, `q` (busca em título e descrição), `ordering` (`dataCriacao` ou `-dataCriacao`, padrão `-dataCriacao`) |
| `/api/categorias` | `tipo`, `q` (busca no nome) |
| `/api/itens` | `q` (busca no nome) |

## Tipos de pedido e regras de preenchimento

O tipo vem da **categoria** escolhida (`tipo` = `material`, `servico` ou `documento`).

| Campo | Material | Serviço de máquina | Declaração |
| --- | :---: | :---: | :---: |
| `categoriaId`, `titulo`, `autorId` | obrigatório | obrigatório | obrigatório |
| `itens` (lista com `itemId` e `quantidade`) | **1 ou mais** | não se aplica | não se aplica |
| `localizacao` | opcional | **obrigatória** | não se aplica |
| `descricao` (em declaração, a finalidade), `dataDesejada` | opcional | opcional | opcional |

Em cada item, a `unidade` é opcional: se omitida, usa a `unidadePadrao` do item do catálogo. O mesmo item não pode se repetir no mesmo pedido.

## Estados de status do pedido

| Valor | Significado | Vale para | Pode ir para |
| --- | --- | --- | --- |
| `solicitado` | Estado inicial, definido ao criar | todos | `emAnalise`, `negado`, `cancelado` |
| `emAnalise` | Associação avaliando | todos | `aprovado`\*, `encaminhado`\*\*, `negado`, `cancelado` |
| `aprovado` | Associação aprovou; falta entregar o item ou emitir o documento | material, documento | `atendido`, `negado` |
| `encaminhado` | Associação encaminhou à Prefeitura | serviço | `atendido`, `negado` |
| `atendido` | Item entregue, serviço realizado ou declaração entregue | todos | (final) |
| `negado` | Não será atendido; exige `observacao` | todos | (final) |
| `cancelado` | Cancelado pelo morador | todos | (final) |

\* somente material ou documento · \*\* somente serviço. Transição inválida retorna `400`; o morador tentando qualquer status além de `cancelado` (ou cancelando pedido alheio) retorna `403`. Toda mudança gera um registro de histórico.

## Exemplos

### Listagem (`GET /api/pedidos?status=solicitado&tipo=material&pageSize=5`)

```json
{
  "count": 2,
  "page": 1,
  "pageSize": 5,
  "totalPages": 1,
  "results": [
    {
      "id": 1,
      "categoria": { "id": 1, "nome": "Sementes", "tipo": "material" },
      "titulo": "Sementes para o plantio de março",
      "descricao": null,
      "dataDesejada": "2026-12-15",
      "localizacao": null,
      "itens": [
        { "item": { "id": 1, "nome": "Semente de milho" }, "quantidade": 20, "unidade": "kg" },
        { "item": { "id": 2, "nome": "Semente de feijão" }, "quantidade": 10, "unidade": "kg" }
      ],
      "autor": { "id": 2, "nome": "Maria Silva" },
      "status": "solicitado",
      "dataCriacao": "2026-11-11T02:29:42.924Z",
      "dataAtualizacao": "2026-11-11T02:29:42.924Z"
    }
  ]
}
```

### Criar pedido de material (`POST /api/pedidos`, 201)

```json
{
  "autorId": 2,
  "categoriaId": 2,
  "titulo": "Adubo para a roça",
  "dataDesejada": "2026-12-01",
  "itens": [
    { "itemId": 3, "quantidade": 10 },
    { "itemId": 4, "quantidade": 5.5, "unidade": "saco" }
  ]
}
```

### Criar pedido de serviço de máquina (201)

```json
{
  "autorId": 3,
  "categoriaId": 5,
  "titulo": "Rodagem do ramal de acesso",
  "descricao": "Trecho com buracos, da porteira até a casa de farinha.",
  "localizacao": { "latitude": -8.124321, "longitude": -34.986543 }
}
```

### Criar pedido de declaração (201)

```json
{
  "autorId": 2,
  "categoriaId": 6,
  "titulo": "Declaração de morador",
  "descricao": "Para apresentar em banco."
}
```

### Alterar o status (`PATCH /api/pedidos/{id}/status`, 200)

```json
{
  "status": "encaminhado",
  "observacao": "Ofício enviado à Prefeitura.",
  "responsavelId": 1
}
```

`observacao` é obrigatória quando o status é `negado`. O morador só pode enviar `{ "status": "cancelado", "responsavelId": <o próprio id> }`.

### Histórico (`GET /api/pedidos/{id}/historico`)

```json
[
  { "id": 12, "statusAnterior": null, "statusNovo": "solicitado", "observacao": null,
    "responsavel": { "id": 2, "nome": "Maria Silva" }, "data": "2026-11-11T02:29:42.924Z" },
  { "id": 14, "statusAnterior": "solicitado", "statusNovo": "emAnalise", "observacao": null,
    "responsavel": { "id": 1, "nome": "José Amaro" }, "data": "2026-11-11T02:29:56.248Z" }
]
```

### Categoria (`POST /api/categorias`, 201) e item (`POST /api/itens`, 201)

```json
{ "nome": "Sementes", "tipo": "material" }
```

```json
{ "nome": "Semente de milho", "unidadePadrao": "kg" }
```

## Exemplos de erro

### Validação: 400

```json
{
  "titulo": ["Este campo é obrigatório."],
  "itens.0.quantidade": ["Deve ser maior que zero."],
  "admin": ["Campo não permitido."]
}
```

### Regra do tipo de pedido: 400

```json
{ "itens": ["Informe ao menos um item para pedidos de material."] }
```

```json
{ "localizacao": ["Informe a localização para pedidos de serviço de máquina."] }
```

### Transição inválida ou motivo ausente: 400

```json
{ "status": ["Não é possível mudar de \"atendido\" para \"emAnalise\"."] }
```

```json
{ "observacao": ["Informe o motivo ao negar um pedido."] }
```

### Sem permissão: 403

```json
{ "detail": "Você não tem permissão para realizar esta operação." }
```

### Não encontrado: 404

```json
{ "detail": "Pedido não encontrado." }
```

### Conflito: 409

```json
{ "detail": "O pedido só pode ser alterado ou apagado enquanto estiver \"solicitado\"." }
```

```json
{ "detail": "Não é possível apagar uma categoria que já tem pedidos." }
```

```json
{ "detail": "Já existe um item com esse nome." }
```
