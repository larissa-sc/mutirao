# 1 - Escopo MVP

| MVP | Fora do escopo | Futuro |
| ---| --- | --- |
| Cadastro e autenticação de usuários | Integração direta com sistemas da Prefeitura | Notificações sobre mudança de status |
| Pedido de material (sementes, adubo, ferramentas) e de serviço de máquina (trator, patrol), com item, quantidade e, nos serviços, localização | Entrega dos itens ou execução dos serviços pela plataforma | Filtros e buscas mais avançados |
| Consulta, acompanhamento e cancelamento dos próprios pedidos pelo morador | Chat entre moradores e Associação | Histórico mais detalhado das alterações do pedido |
| Consulta e organização dos pedidos pela Associação | Aplicativo mobile nativo | Relatórios simples sobre os pedidos |
| Atualização do status pela Associação: aprovar, negar com motivo, encaminhar à Prefeitura e marcar como atendido | Controle de estoque e de prioridade/fila de pedidos | Melhorias visuais e recursos adicionais de visualização |


## 2 - Justificativa do que ficou fora do escopo

O Mutirão tem como objetivo organizar a comunicação entre moradores e Associação, e não substituir os processos da Associação ou da Prefeitura.

Por isso, a integração direta com a Prefeitura e a entrega dos itens ou execução dos serviços ficam fora do escopo. Os serviços de máquina (trator e patrol) são da Prefeitura: o sistema registra o pedido e o encaminhamento feito pela Associação, e o atendimento continua sob responsabilidade da Associação e dos órgãos responsáveis.

Também ficam fora do MVP funcionalidades que aumentariam significativamente a complexidade, como chat, aplicativo mobile nativo e controle de estoque.


## 3 - Critérios de sucesso

Como cada meta será medida, com os números de participantes: [metas.md](metas.md).

| Objetivo | Como mediremos | Meta |
| --- | --- | --- |
| Facilitar o registro de um pedido | Cronometrar o pedido completo de 5 moradores, 2 pedidos cada | **90% dos pedidos concluídos em até 5 minutos** |
| Garantir que os pedidos tenham informações suficientes para atendimento | Verificar os pedidos do período de validação | **100% dos pedidos com os campos obrigatórios** (material: item e quantidade; serviço: item e local) |
| Centralizar o registro dos pedidos | Contar os pedidos registrados no período de validação | **Pelo menos 20 pedidos registrados no sistema** |
| Permitir que o morador acompanhe seu pedido | Testar o fluxo de consulta com moradores | **100% dos moradores participantes consultam seus próprios pedidos e o status** |
| Facilitar o acesso da Associação às informações | Teste com membros da Associação para localizar pedidos | **90% dos pedidos de teste localizados em até 1 minuto** |
| Registrar o andamento | Teste com membros da Associação respondendo pedidos | **100% dos pedidos respondidos com status atualizado visível ao morador** |
