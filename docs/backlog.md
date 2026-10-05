# Backlog do projeto

| ID | História de usuário | Prioridade |
| --- | --- | --- |
| US01 | Como **morador/agricultor**, quero criar uma conta com e-mail e senha ou entrar com Google para acessar o Mutirão. | Must |
| US02 | Como **morador/agricultor**, quero fazer um pedido de material (sementes, adubo, ferramentas), de serviço de máquina (trator, patrol) ou de declaração (morador, convivência), informando o que preciso, para solicitá-lo à Associação. | Must |
| US03 | Como **morador/agricultor**, quero consultar meus pedidos e seus status, e cancelar um pedido que não preciso mais, para acompanhar o que solicitei. | Must |
| US04 | Como **membro da Associação**, quero visualizar e organizar os pedidos dos moradores para saber o que está pendente. | Must |
| US05 | Como **membro da Associação**, quero aprovar, negar (com motivo), encaminhar à Prefeitura ou marcar como atendido um pedido, para registrar seu andamento. | Must |

## Plano de trabalho

Capacidade da equipe: **10 h/semana no total** (2 pessoas). Cada história se divide em duas partes que podem andar em paralelo, usando o [contrato da API](contrato-api.md) como combinado:

- **API (backend):** Marcos, com revisão da Larissa.
- **Tela (frontend):** Larissa, com revisão do Marcos. Enquanto a API não está pronta, usa dados de exemplo do contrato.

Estimativas em horas, incluindo testes de cada parte. Os responsáveis são uma proposta a confirmar com a Larissa (ver [acordo de equipe](acordo-de-equipe.md) e [decisões técnicas](decisoes-tecnicas.md)).

| Ordem | ID | API (Marcos) | Tela (Larissa) | Total | Depende de | Semana prevista |
| :---: | --- | :---: | :---: | :---: | --- | :---: |
| 1 | US01 | 4 h | 4 h | 8 h | — | 15 |
| 2 | US02 | 6 h | 6 h | 12 h | US01 | 15–16 |
| 3 | US03 | 3 h | 3 h | 6 h | US01, US02 | 16 |
| 4 | US04 | 3 h | 5 h | 8 h | US01, US02 | 16–17 |
| 5 | US05 | 3 h | 3 h | 6 h | US04 | 17 |
| | **Total** | **19 h** | **21 h** | **40 h** | | |

Sobram cerca de 10 h para testes com usuários, ajustes e documentação. O cronograma completo está em [cronograma.md](cronograma.md).

**Ordem de execução:** US01 vem primeiro porque todas as demais exigem usuário autenticado; US02 antes de US03/US04 porque sem pedidos não há o que consultar; US05 por último porque depende da tela da Associação (US04).

## Critérios de aceite

Cada critério é verificável com um teste (automatizado ou manual). A história só é considerada pronta quando todos os critérios passam e a [Definition of Done](acordo-de-equipe.md#definition-of-done) é cumprida. Regras detalhadas em [dominio.md](dominio.md) e [contrato-api.md](contrato-api.md).

### US01 — Login e criação de conta

- O usuário consegue criar uma conta com e-mail e senha ou entrar com Google, usando o Firebase Auth.
- Após entrar, o frontend chama `POST /api/auth/cadastro` e o backend cria o usuário com papel `morador` (ou devolve o já existente, sem duplicar).
- `GET /api/auth/eu` retorna os dados do usuário logado.
- Requisição sem token, ou com token inválido ou expirado, retorna `401`.
- O sistema não recebe nem guarda senhas; elas ficam no Firebase.
- O usuário consegue sair (logout) e perde o acesso às telas protegidas.

### US02 — Fazer pedido

- O morador autenticado consegue criar um pedido e recebe `201`, com status `solicitado`.
- Em pedido de **material**, categoria, item, quantidade e unidade são obrigatórios; a falta de qualquer um retorna `400` indicando o campo.
- Em pedido de **serviço de máquina**, categoria, item e localização são obrigatórios; quantidade é opcional.
- Em pedido de **declaração**, categoria e item (tipo da declaração) são obrigatórios; a finalidade vai na descrição.
- Descrição e data desejada são opcionais.
- O pedido fica associado ao morador que o criou.
- Usuário não autenticado recebe `401` ao tentar criar.

### US03 — Consultar e cancelar pedidos

- O morador consegue visualizar a lista dos seus próprios pedidos, paginada.
- Cada pedido apresenta seu status atual.
- O morador consegue ver o histórico de status e, se o pedido foi negado, o motivo.
- O morador não consegue acessar pedidos de outros moradores (`403` na consulta por ID; ausentes na listagem).
- O morador consegue cancelar o próprio pedido enquanto estiver `solicitado` ou `emAnalise`; depois disso, o cancelamento retorna `400`.

### US04 — Visualizar e organizar pedidos

- A Associação consegue visualizar os pedidos de todos os moradores.
- É possível consultar todas as informações do pedido (categoria, item, quantidade, local, autor, data desejada, status).
- A Associação consegue filtrar por tipo (material/serviço/declaração), categoria e status e ordenar por data.
- Morador não tem acesso à listagem geral.

### US05 — Responder pedido e atualizar status

- A Associação consegue colocar o pedido em análise, aprová-lo (material ou declaração), encaminhá-lo à Prefeitura (serviço), negá-lo ou marcá-lo como atendido, seguindo as transições permitidas.
- Negar exige uma observação com o motivo.
- Transição inválida retorna `400` (por exemplo, `aprovado` em pedido de serviço, ou `encaminhado` em material).
- O novo status e, se houver, a observação ficam disponíveis para consulta pelo morador.
- Cada mudança gera um registro no histórico com responsável e data.
- Apenas usuários da Associação podem alterar o status (o morador só cancela o próprio pedido; outras tentativas retornam `403`).
