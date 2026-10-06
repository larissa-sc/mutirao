# Contrato da API - Mutirão

## Objetivo

Este documento define o contrato de comunicação entre o frontend e o backend do sistema Mutirão, especificando os recursos disponíveis, rotas, métodos HTTP, formatos de resposta, regras de acesso, paginação, filtros e formato dos erros.

> **Terminologia:** o termo oficial é **pedido** (rota `pedidos`, campos e documentos). Regras de negócio, atributos e transições estão em [dominio.md](dominio.md).

## As 9 decisões do contrato

| | Decisão |
| --- | --- |
| Prefixo e versão | `/api` (sem versionamento na Etapa 1) |
| Autenticação | Firebase Auth (e-mail e senha, ou Google). O frontend faz o login no Firebase e envia o ID token em todas as requisições: `Authorization: Bearer <idToken>` |
| Barra final nas rotas | NÃO. Vale também para os links `next` e `previous` da paginação |
| Convenção de nomes dos campos | `camelCase` |
| Formato de datas | ISO 8601 em UTC para data/hora (`2026-09-29T10:30:00Z`) e `AAAA-MM-DD` para `dataDesejada` |
| Formato de valores monetários | Não se aplica (o sistema não trabalha com valores monetários) |
| Paginação: estilo e tamanho padrão | `count`, `next`, `previous` e `results`; parâmetros `?page=` (começa em 1) e `?pageSize=` (padrão 20, máximo 100) |
| Como se filtra, ordena e busca | Query string: `?q=` (busca em item e descrição), `?ordering=` (ex.: `-dataCriacao`) e filtros: `?status=`, `?categoriaId=`, `?tipo=material\|servico\|documento` |
| Formato do erro de validação e do erro de permissão | JSON. `400` validação (objeto campo → lista de mensagens), `401` não autenticado e `403` sem permissão (objeto com `detail`) |
| Relações | Aninhadas na leitura (`categoria`, `autor`, `localizacao`); na escrita, informadas por ID (`categoriaId`) |

## Perfis (papéis)

| Papel | Valor no campo `papel` | Descrição |
| --- | --- | --- |
| Morador | `morador` | Criado automaticamente no primeiro acesso (`/api/auth/cadastro`) |
| Associação | `associacao` | Membro da Associação. Não se cadastra pela API; é promovido pela administração (T.I. da Associação) |

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

\* somente pedidos de categoria de tipo `material` ou `documento` · \*\* somente de tipo `servico`.

Transição inválida retorna `400`. Toda mudança gera um registro de histórico (ver [dominio.md](dominio.md#historicostatus)).

## Tabela de Recursos e permissões

Legenda: **Público** = sem login · **Morador\*** = apenas o autor do pedido · **Associação** = qualquer membro da Associação.

| Recurso | Método | Rota | O que faz | Sucesso | Quem pode |
| --- | --- | --- | --- | --- | --- |
| Pedido | GET | `/api/pedidos` | Lista (paginada) | 200 | Morador (vê só os seus) · Associação (vê todos) |
| | POST | `/api/pedidos` | Cria pedido | 201 | Morador · Associação |
| | GET | `/api/pedidos/{id}` | Consulta | 200 | Morador\* · Associação |
| | PATCH | `/api/pedidos/{id}` | Atualiza item, quantidade, unidade, descrição, data desejada ou localização | 200 | Morador\* (somente enquanto `solicitado`) |
| | PATCH | `/api/pedidos/{id}/status` | Altera o status | 200 | Associação (qualquer transição válida) · Morador\* (somente `cancelado`) |
| | GET | `/api/pedidos/{id}/historico` | Lista o histórico de status | 200 | Morador\* · Associação |
| Categoria | GET | `/api/categorias` | Lista | 200 | Qualquer usuário autenticado |
| | GET | `/api/categorias/{id}` | Consulta | 200 | Qualquer usuário autenticado |
| Autenticação | POST | `/api/auth/cadastro` | Cria o usuário no primeiro acesso (morador) ou devolve o existente; usa o nome do token ou o `nome` enviado | 201 (criado) / 200 (já existia) | Token do Firebase válido |
| | GET | `/api/auth/eu` | Usuário atual | 200 / 401 | Autenticado |

Regras gerais de acesso:

- Login e logout acontecem no Firebase (frontend); a API não tem rotas de login nem de logout.
- Todas as rotas exigem token válido. Sem token, ou com token inválido ou expirado, retornam `401`.
- Morador acessando pedido de outro morador: `403` (em `GET /{id}`, `PATCH`, `/status`, `/historico`).
- Morador tentando qualquer status além de `cancelado`: `403`.
- Pedidos não são removidos: o cancelamento é uma mudança de status (por isso não existe `DELETE`).
- Pedido inexistente: `404`.

## Exemplos de resposta JSON

### Listagem (`GET /api/pedidos?page=1&status=solicitado`)

```json
{
  "count": 42,
  "next": "https://mutirao.org/api/pedidos?page=2&status=solicitado",
  "previous": null,
  "results": [
    {
      "id": 10,
      "categoria": { "id": 1, "nome": "Sementes", "tipo": "material" },
      "item": "Semente de milho",
      "quantidade": 20,
      "unidade": "kg",
      "descricao": null,
      "dataDesejada": "2026-11-15",
      "localizacao": null,
      "autor": { "id": 7, "nome": "Maria Silva" },
      "dataCriacao": "2026-09-29T10:30:00Z",
      "status": "solicitado"
    },
    {
      "id": 11,
      "categoria": { "id": 5, "nome": "Serviço de patrol", "tipo": "servico" },
      "item": "Rodagem do ramal de acesso",
      "quantidade": null,
      "unidade": null,
      "descricao": "Trecho com buracos, da porteira até a casa de farinha.",
      "dataDesejada": null,
      "localizacao": { "latitude": -8.124321, "longitude": -34.986543 },
      "autor": { "id": 12, "nome": "João Santos" },
      "dataCriacao": "2026-09-29T11:15:00Z",
      "status": "encaminhado"
    }
  ]
}
```

### Detalhes (`GET /api/pedidos/{id}`)

```json
{
  "id": 11,
  "categoria": { "id": 5, "nome": "Serviço de patrol", "tipo": "servico" },
  "item": "Rodagem do ramal de acesso",
  "quantidade": null,
  "unidade": null,
  "descricao": "Trecho com buracos, da porteira até a casa de farinha.",
  "dataDesejada": null,
  "localizacao": { "latitude": -8.124321, "longitude": -34.986543 },
  "autor": { "id": 12, "nome": "João Santos" },
  "dataCriacao": "2026-09-29T11:15:00Z",
  "dataAtualizacao": "2026-09-30T14:00:00Z",
  "status": "encaminhado"
}
```

Campos sem valor são retornados como `null` (por exemplo, `localizacao` em pedido de material).

### Histórico (`GET /api/pedidos/{id}/historico`)

```json
[
  {
    "id": 1,
    "statusAnterior": null,
    "statusNovo": "solicitado",
    "observacao": null,
    "responsavel": { "id": 12, "nome": "João Santos" },
    "data": "2026-09-29T11:15:00Z"
  },
  {
    "id": 2,
    "statusAnterior": "solicitado",
    "statusNovo": "emAnalise",
    "observacao": null,
    "responsavel": { "id": 3, "nome": "José Amaro" },
    "data": "2026-09-30T09:00:00Z"
  },
  {
    "id": 3,
    "statusAnterior": "emAnalise",
    "statusNovo": "encaminhado",
    "observacao": "Ofício enviado à Prefeitura.",
    "responsavel": { "id": 3, "nome": "José Amaro" },
    "data": "2026-09-30T14:00:00Z"
  }
]
```

## Exemplos de criação do pedido

`POST /api/pedidos` com corpo JSON. O autor é identificado pelo token e o status inicial é sempre `solicitado`. Resposta `201` no formato de **Detalhes**.

### Pedido de material

```json
{
  "categoriaId": 1,
  "item": "Semente de milho",
  "quantidade": 20,
  "unidade": "kg",
  "dataDesejada": "2026-11-15"
}
```

### Pedido de serviço de máquina

```json
{
  "categoriaId": 5,
  "item": "Rodagem do ramal de acesso",
  "descricao": "Trecho com buracos, da porteira até a casa de farinha.",
  "localizacao": { "latitude": -8.124321, "longitude": -34.986543 }
}
```

### Pedido de declaração

```json
{
  "categoriaId": 6,
  "item": "Declaração de morador",
  "descricao": "Para apresentar em banco."
}
```

Regras de preenchimento:

| Campo | Material | Serviço | Documento |
| --- | :---: | :---: | :---: |
| `categoriaId`, `item` | obrigatório | obrigatório | obrigatório |
| `quantidade`, `unidade` | obrigatório | opcional | não se aplica |
| `localizacao` | opcional | obrigatório | não se aplica |
| `descricao` (finalidade, no documento), `dataDesejada` | opcional | opcional | opcional |

## Exemplo de atualização de status

`PATCH /api/pedidos/{id}/status`, corpo JSON:

```json
{
  "status": "negado",
  "observacao": "Estoque de sementes esgotado neste mês."
}
```

Resposta `200` no formato de **Detalhes**. `observacao` é obrigatória quando o status é `negado` e opcional nos demais. O morador só pode enviar `{ "status": "cancelado" }`.

## Exemplos de erro

### Erro de validação - 400 Bad Request

```json
{
  "item": ["Este campo é obrigatório."],
  "quantidade": ["Informe a quantidade para pedidos de material."]
}
```

### Transição de status inválida - 400 Bad Request

```json
{
  "status": ["Não é possível mudar de \"atendido\" para \"emAnalise\"."]
}
```

### Usuário não autenticado — 401 Unauthorized

```json
{
  "detail": "Token ausente, inválido ou expirado."
}
```

### Usuário sem permissão — 403 Forbidden

```json
{
  "detail": "Você não tem permissão para realizar esta operação."
}
```

```json
{
  "detail": "Este pedido não pode mais ser alterado porque já está em análise."
}
```
