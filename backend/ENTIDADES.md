# Entidades do backend

Base do modelo de dados do Mutirão, com TypeORM. As regras de negócio de cada entidade estão em `docs/dominio.md` (na branch de documentação) e o contrato das rotas em `docs/contrato-api.md`.

## Relacionamentos

```mermaid
erDiagram
    USUARIO ||--o{ PEDIDO : "faz (autor)"
    CATEGORIA ||--o{ PEDIDO : classifica
    PEDIDO |o--o| LOCALIZACAO : "situa (1:0..1)"
    PEDIDO ||--o{ HISTORICO_STATUS : possui
    USUARIO ||--o{ HISTORICO_STATUS : "altera (responsável)"

    USUARIO {
        int id PK
        string firebaseUid UK
        string nome
        string email UK
        enum papel "morador | associacao"
        date dataCriacao
    }
    CATEGORIA {
        int id PK
        string nome UK
        enum tipo "material | servico | documento"
    }
    LOCALIZACAO {
        int id PK
        double latitude
        double longitude
    }
    PEDIDO {
        int id PK
        int categoriaId FK
        string item
        decimal quantidade "opcional"
        string unidade "opcional"
        text descricao "opcional"
        date dataDesejada "opcional"
        int localizacaoId FK "opcional"
        int autorId FK
        enum status "solicitado..cancelado"
        date dataCriacao
        date dataAtualizacao
    }
    HISTORICO_STATUS {
        int id PK
        int pedidoId FK
        enum statusAnterior "nulo no primeiro"
        enum statusNovo
        text observacao "opcional"
        int responsavelId FK
        date data
    }
```

| Entidade | Arquivo | Tabela |
| --- | --- | --- |
| Usuario | `src/usuarios/usuario.entity.ts` | `usuarios` |
| Categoria | `src/categorias/categoria.entity.ts` | `categorias` |
| Localizacao | `src/pedidos/localizacao.entity.ts` | `localizacoes` |
| Pedido | `src/pedidos/pedido.entity.ts` | `pedidos` |
| HistoricoStatus | `src/pedidos/historico-status.entity.ts` | `historico_status` |

## Comportamento ao apagar

| Relação | Ao apagar o lado "um" |
| --- | --- |
| Categoria → Pedido | Bloqueia (`RESTRICT`): categoria com pedidos não pode ser apagada |
| Usuario → Pedido | Bloqueia (`RESTRICT`) |
| Usuario → HistoricoStatus | Bloqueia (`RESTRICT`) |
| Pedido → HistoricoStatus | Apaga junto (`CASCADE`) |

Na prática pedidos não são apagados; o cancelamento é uma mudança de status.

## Banco de dados

O banco ainda não foi definido (candidato: Supabase/Postgres). Por isso a conexão é opcional:

- Sem `DATABASE_URL`, a API sobe normalmente, sem banco.
- Com `DATABASE_URL`, o `DatabaseModule` conecta ao Postgres e registra as entidades.

Copie `.env.example` para `.env` e preencha. Em desenvolvimento, `DB_SYNC=true` cria as tabelas a partir das entidades. Em produção use migrations.

```bash
node --env-file=.env dist/main.js
```

## Testes

`src/database/entidades.spec.ts` monta o modelo sem conectar a nenhum banco e confere tabelas, relações, obrigatoriedade dos campos, enums e a exclusão em cascata do histórico.

```bash
npm run test -w backend
```

## Observações para quem continuar

- As entidades usam `Relation<T>` nas propriedades de relação. Isso evita erro de importação circular em ESM, porque `Pedido`, `Usuario` e `HistoricoStatus` se referenciam.
- Os enums usam `simple-enum`, que funciona em qualquer banco e guarda o valor como texto.
- As regras de negócio (campos obrigatórios por tipo de pedido, transições de status e permissões) ficam nos serviços, não nas entidades.
