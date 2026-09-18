# Canvas do Projeto

**Projeto:** `MUTIRÃO`.
**Equipe:** `Larissa Cavalcante e Marcos Gomes`.
**Data:** `2026-09-08`.
**Organização parceira:** `Associação de Moradores de Vila Nova de Cana Brava`.

---

## 1. Problema

> Na Associação de Moradores de Vila Nova de Cana Brava, os moradores precisam reportar à Associação os problemas observados na infraestrutura do bairro e a organização precisa manter os registros para uma melhor organização e repasse de informações à prefeitura. Atualmente, esse processo é realizado principalmente de forma verbal entre moradores e integrantes da Associação, o que pode causar ruídos de comunicação, perda de informações e registros incorretos sobre os problemas observados.

**Evidências de que o problema existe**:

Houve momentos em que a comunicação verbal não foi clara o suficiente, o que ocasionou em uma falta de entendimento sobre o problema observado;
Moradores que recorrem à ouvidoria municipal não consegue um retorno ágil;
Moradores que não sabem como chegar à associação e não confiam na ouvidoria municipal não conseguem reportar as demandas observadas na comunidade.
A ausência de um registro centralizado dificulta a organização e o acompanhamento das demandas pela Associação. 

## 2. Quem é afetado

| Quem | Quantas pessoas | Como é afetado hoje |
|---|---|---|
| Moradores da comunidade | Cerca de 300 | Possuem dificuldade para registrar e acompanhar problemas encontrados na comunidade |
| Equipe da associação | Cerca de 10 | Recebe informações de maneira descentralizada e precisa organizar manualmente as demandas |

## 3. Solução proposta

Um sistema web simples para a comunidade, que permita aos moradores reportar um problema de infraestrutura do bairro - com descrição, categoria, foto e localização. A associação (que já tem um canal aberto com a prefeitura) poderá visualizar, organizar, classificar e acompanhar as demandas registradas pelos moradores, mantendo um histórico das ocorrências e de seu andamento. 

>

## 4. Funcionalidades do MVP (3 a 5)

| # | Funcionalidade | Para quem | Por que é essencial |
|---|---|---|---|
| 1 | Cadastro/login do morador | Morador | Permite identificar quem está registrando uma demanda |
| 2 | Registro de demanda | Morador | Permite comunicar formalmente um problema observado |
| 3 | Inclusão de descrição, categoria, localização e foto | Morador | Permite fornecer informações suficientes para a Associação compreender o problema |
| 4 | Visualização e organização das demandas | Associação | Centraliza as informações recebidas dos moradores |
| 5 | Atualização do status e acompanhamento das demandas | Associação e Morador | Permite acompanhar o andamento de cada solicitação |

## 5. Fora do escopo

O que **não** faremos nesta versão, e por quê:

| Não faremos | Por quê |
|---|---|
| Integração com sistemas da prefeitura | O MUTIRÃO será focado exclusivamente na comunicação entre moradores e Associação |
| Aplicativo mobile nativo | Uma aplicação web responsiva atende ao MVP e reduz a complexidade |
| Chat em tempo real | Não é essencial para o registro e acompanhamento das demandas |
| Sistema completo de gestão da Associação | O foco será o gerenciamento das demandas da comunidade |

## 6. Usuários e papéis

| Papel | O que pode fazer |
|---|---|
| Morador | Criar demandas, informar descrição, categoria, localização e foto, visualizar suas demandas e acompanhar o andamento |
| Associação | Visualizar todas as demandas, analisar informações, alterar categoria, definir prioridade, atualizar status e registrar observações |

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
| Usuários com pouca familiaridade tecnológica | Utilizar linguagem simples e reduzir a quantidade de etapas para registrar uma demanda |
| Informações incompletas | Definir campos obrigatórios e orientar o preenchimento |
| Associação não conseguir acompanhar as demandas | Criar filtros por status, categoria e prioridade |

## 9. Critérios de sucesso

| Objetivo | Como mediremos | Meta |
|---|---|---|
| Facilitar o registro de problemas | Teste com moradores | Morador conseguir registrar uma demanda sem auxílio da equipe |
| Centralizar as demandas | Quantidade de demandas registradas | Todas as demandas utilizadas no teste serem registradas no sistema |
| Melhorar a organização da Associação | Teste com membros da Associação | Associação conseguir localizar e classificar as demandas |
| Permitir acompanhamento | Verificação dos status | Toda demanda cadastrada possuir um status atualizado |
| Validar a solução | Feedback da organização parceira | Associação considerar o sistema útil para o processo definido |

## 10. O que fica depois

- **Quem opera o sistema:** Membros da Associação de Moradores de Vila Nova de Cana Brava responsáveis pelo acompanhamento das demandas. 
- **Quem mantém tecnicamente:** A equipe do projeto durante o desenvolvimento acadêmico. Após a conclusão, a manutenção dependerá da disponibilidade de responsáveis técnicos.
- **Custo mensal estimado:** R$ 0 inicialmente, utilizando serviços gratuitos de hospedagem e banco de dados dentro dos limites oferecidos. 
- **Licença do código:** A definir pela equipe.