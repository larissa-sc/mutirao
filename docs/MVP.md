# 1 - Escopo MVP

| MVP | Fora do escopo | Futuro |
| ---| --- | --- |
| Cadastro e autenticação de usuários | Integração direta com sistemas da Prefeitura | Notificações sobre mudança de status |
| Registro de ocorrências com título, descrição, categoria, localização e foto opcional | Atendimento ou resolução do problema pela plataforma | Filtros e buscas mais avançados |
| Consulta e acompanhamento das próprias ocorrências pelo morador | hat entre moradores e Associação | CHistórico mais detalhado das alterações da ocorrência |
| Consulta e organização das ocorrências pela Associação | Aplicativo mobile nativo | Relatórios simples sobre as ocorrências |
| Atualização do status das ocorrências pela Associação | Sistema de votação ou avaliação das ocorrências | Melhorias visuais e recursos adicionais de visualização |


## 2 - Justificativa do que ficou fora do escopo

O Mutirão tem como objetivo organizar a comunicação entre moradores e Associação, e não substituir os processos da Associação ou da Prefeitura.

Por isso, a integração direta com a Prefeitura e a resolução dos problemas ficam fora do escopo. O sistema registra, organiza e acompanha as ocorrências, enquanto o encaminhamento e a resolução continuam sob responsabilidade da Associação e dos órgãos responsáveis.

Também ficam fora do MVP funcionalidades que aumentariam significativamente a complexidade, como chat, aplicativo mobile nativo e sistemas de votação.


## 3 - Critérios de sucesso

| Objetivo | Como mediremos | Meta |
| --- | --- | --- |
| Reduzir o tempo necessário para registrar uma ocorrência                       | Cronometrar o registro completo de 5 ocorrências de teste                                | **90% dos registros concluídos em até 5 minutos**                                    |
| Garantir que as ocorrências tenham informações suficientes para encaminhamento | Verificar, em uma amostra de ocorrências, presença de descrição, categoria e localização | **100% das ocorrências registradas com esses três dados**                            |
| Centralizar o registro das demandas                                            | Comparar a quantidade de ocorrências registradas no Mutirão durante o período de teste   | **Pelo menos 20 ocorrências registradas no sistema durante o período de validação**  |
| Permitir que o morador acompanhe sua demanda                                   | Testar o fluxo de consulta de ocorrências com moradores                                  | **100% dos moradores participantes conseguirem consultar suas próprias ocorrências** |
| Facilitar o acesso da Associação às informações                                | Realizar teste com membros da Associação para localizar e consultar ocorrências          | **90% das ocorrências de teste localizadas em até 1 minuto**                         |
