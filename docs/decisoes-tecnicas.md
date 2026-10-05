# Decisões técnicas

Decididas por Marcos Gomes (T.I. da Associação). ⚠️ Confirmar com a Larissa e com o professor onde indicado.

| Tema | Decisão | Observação |
| --- | --- | --- |
| Frontend | React com TypeScript | Responsável: Larissa |
| Backend | NestJS com TypeScript | Responsável: Marcos. Valida o token do Firebase e aplica as regras de negócio e de permissão |
| Login | **Firebase Auth**, com e-mail e senha e com Google | O sistema não guarda senhas. O frontend envia o ID token em `Authorization: Bearer` |
| Banco de dados | **A definir** (candidato: Supabase/PostgreSQL) | ⚠️ O canvas cita PostgreSQL; confirmar com o professor se outro banco é aceito |
| Hospedagem | PaaS gratuita | R$ 0 durante o desenvolvimento |

## Papéis

- Todo usuário novo entra como `morador`.
- O papel `associacao` é atribuído pela administração (T.I. da Associação), diretamente no banco ou por configuração.

## Por que o frontend não fala direto com o banco

As regras de status, as transições permitidas e as permissões por papel ficam no backend, em um só lugar, seguindo o [contrato da API](contrato-api.md).
