# Backlog do projeto

| ID | História de usuário | Prioridade |
| --- | --- | --- |
| US01 | Como **morador**, quero criar uma conta e fazer login para acessar o Mutirão.                                                                                             | Must       |
| US02 | Como **morador**, quero registrar uma ocorrência informando título, descrição, categoria e localização, podendo anexar uma foto, para comunicar um problema à Associação. | Must       |
| US03 | Como **morador**, quero consultar minhas ocorrências e seus status para acompanhar as demandas que registrei.                                                             | Must       |
| US04 | Como **membro da Associação**, quero visualizar e organizar as ocorrências registradas pelos moradores para acompanhar as demandas da comunidade.                         | Must       |
| US05 | Como **membro da Associação**, quero atualizar o status de uma ocorrência para registrar seu andamento.                                                                   | Must       |


## Critérios de aceite

### US01 — Cadastro e login

O usuário consegue criar uma conta com os dados obrigatórios.
O usuário consegue realizar login com credenciais válidas.
O sistema impede cadastro com e-mail já utilizado.

### US02 — Registrar ocorrência

O morador autenticado consegue registrar uma ocorrência.
Título, descrição, categoria e localização são obrigatórios.
A foto é opcional.
A ocorrência fica associada ao morador que a criou.

### US03 — Consultar ocorrências

O morador consegue visualizar suas próprias ocorrências.
Cada ocorrência apresenta seu status.
O morador não consegue acessar ocorrências de outros moradores.

### US04 — Visualizar e organizar ocorrências

A Associação consegue visualizar as ocorrências registradas.
É possível consultar as informações da ocorrência.
A Associação consegue organizar as ocorrências por categoria/status.

### US05 — Atualizar status

A Associação consegue alterar o status de uma ocorrência.
O novo status fica disponível para consulta pelo morador.
Apenas usuários autorizados podem alterar o status.