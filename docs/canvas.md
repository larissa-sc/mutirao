# Canvas do Projeto

**Projeto:** `MUTIRÃO`.
**Equipe:** `Larissa Cavalcante e Marcos Gomes`.
**Data:** `2026-09-08`.
**Organização parceira:** `Associação de Moradores de Vila Nova de Cana Brava`.

---

## 1. Problema

> Na Associação dos Moradores e Agricultores Familiares da Vila Nova de Cana Brava, os moradores e agricultores precisam solicitar à Associação itens, serviços e documentos, como sementes, adubo, ferramentas, serviços de máquina (trator e patrol) e declarações (morador, convivência), e a Associação precisa manter registro desses pedidos e de seu andamento, inclusive dos que são encaminhados à Prefeitura. Atualmente, esse processo é realizado principalmente de forma verbal e informal, o que causa ruídos de comunicação, desencontros e perda do histórico dos pedidos.

**Evidências de que o problema existe**:

Confirmado pelo presidente da Associação (Marcos Gomes da Silva): grande parte das demandas chega de forma verbal e informal, gerando ruídos, desencontros e perda de histórico dos pedidos;
As ouvidorias municipais costumam ser lentas, e muitos moradores não sabem como acioná-las ou ficam sem retorno rápido;
A ausência de um registro centralizado dificulta a organização e o acompanhamento dos pedidos pela Associação.

## 2. Quem é afetado

| Quem | Quantas pessoas | Como é afetado hoje |
|---|---|---|
| Moradores da comunidade | Cerca de 300 | Têm dificuldade para fazer pedidos à Associação e saber se foram atendidos |
| Equipe da associação | Cerca de 10 | Recebe pedidos de maneira descentralizada e precisa organizá-los manualmente |

## 3. Solução proposta

Um sistema web simples para a comunidade, que permita aos moradores e agricultores fazer pedidos à Associação: de **material** (sementes, adubo, ferramentas), de **serviço de máquina** (trator e patrol, que são da Prefeitura) ou de **declaração** (emitida pela Associação e assinada pelo presidente). A Associação poderá visualizar, organizar e responder os pedidos (aprovar, negar com motivo, encaminhar à Prefeitura ou marcar como atendido), mantendo um histórico do andamento que o morador consegue acompanhar.

>

## 4. Funcionalidades do MVP (3 a 5)

| # | Funcionalidade | Para quem | Por que é essencial |
|---|---|---|---|
| 1 | Cadastro/login do morador | Morador | Permite identificar quem está fazendo o pedido |
| 2 | Pedido de material, serviço de máquina ou declaração | Morador | Permite solicitar formalmente o que precisa à Associação |
| 3 | Informar categoria, item, quantidade e, nos serviços, a localização | Morador | Permite à Associação entender exatamente o que foi pedido e onde |
| 4 | Visualização e organização dos pedidos | Associação | Centraliza os pedidos recebidos dos moradores |
| 5 | Resposta ao pedido e acompanhamento do status | Associação e Morador | Permite acompanhar o andamento de cada pedido |

## 5. Fora do escopo

O que **não** faremos nesta versão, e por quê:

| Não faremos | Por quê |
|---|---|
| Integração com sistemas da prefeitura | O MUTIRÃO registra o encaminhamento feito pela Associação, mas não se conecta aos sistemas da Prefeitura |
| Aplicativo mobile nativo | Uma aplicação web responsiva atende ao MVP e reduz a complexidade |
| Chat em tempo real | Não é essencial para o registro e acompanhamento dos pedidos |
| Controle de estoque e fila de prioridade | O foco é registrar e acompanhar os pedidos; a decisão continua com a Associação |
| Sistema completo de gestão da Associação | O foco será o gerenciamento dos pedidos da comunidade |

## 6. Usuários e papéis

| Papel | O que pode fazer |
|---|---|
| Morador | Fazer pedidos, informar categoria, item, quantidade e localização, visualizar e cancelar os próprios pedidos e acompanhar o andamento |
| Associação | Visualizar todos os pedidos, filtrar por tipo e status, aprovar, negar (com motivo), encaminhar à Prefeitura, marcar como atendido e registrar observações |

## 7. Restrições

| Tipo | Restrição |
|---|---|
| Prazo | Semana 18 |
| Equipe | 2 pessoas, 10h/semana no total |
| Técnica | TypeScript (NestJS + React), PostgreSQL, PaaS gratuita |
| Contexto de uso | Aplicação web acessível por computador ou smartphone com conexão à internet |
| Orçamento | R$ 0 durante o desenvolvimento, utilizando serviços gratuitos |
| Público | Moradores da comunidade e membros da Associação |

## 8. Riscos principais

| Risco | O que faremos |
|---|---|
| Baixa adesão dos moradores | Criar uma interface simples e validar a usabilidade com moradores |
| Usuários com pouca familiaridade tecnológica | Utilizar linguagem simples e reduzir a quantidade de etapas para fazer um pedido |
| Pedidos incompletos | Definir campos obrigatórios por tipo de pedido e orientar o preenchimento |
| Associação não conseguir acompanhar os pedidos | Criar filtros por tipo, categoria e status |

## 9. Critérios de sucesso

| Objetivo | Como mediremos | Meta |
|---|---|---|
| Facilitar o pedido | Teste com moradores | Morador conseguir fazer um pedido sem auxílio da equipe |
| Centralizar os pedidos | Quantidade de pedidos registrados | Todos os pedidos utilizados no teste serem registrados no sistema |
| Melhorar a organização da Associação | Teste com membros da Associação | Associação conseguir localizar e responder os pedidos |
| Permitir acompanhamento | Verificação dos status | Todo pedido cadastrado possuir um status atualizado |
| Validar a solução | Feedback da organização parceira | Associação considerar o sistema útil para o processo definido |

## 10. O que fica depois

- **Quem opera o sistema:** Membros da Associação de Moradores de Vila Nova de Cana Brava responsáveis pelo acompanhamento dos pedidos. 
- **Quem mantém tecnicamente:** A equipe do projeto durante o desenvolvimento acadêmico. Após a conclusão, a manutenção dependerá da disponibilidade de responsáveis técnicos.
- **Custo mensal estimado:** R$ 0 inicialmente, utilizando serviços gratuitos de hospedagem e banco de dados dentro dos limites oferecidos. 
- **Licença do código:** A definir pela equipe.