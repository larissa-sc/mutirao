# Cronograma

Marcos do projeto conforme o canvas: diagnóstico na **semana 14**, entrega na **semana 18** e devolutiva final na **semana 20**. Capacidade: 10 h/semana no total.

> ⚠️ Preencher a coluna **Data limite** com as datas reais do calendário da disciplina. Os responsáveis seguem a proposta do [acordo de equipe](acordo-de-equipe.md).

| Fase | Entrega | Responsável | Semana | Data limite |
| --- | --- | --- | :---: | --- |
| **Planejamento** | Ata do diagnóstico com a Associação | Larissa e Marcos | 14 | ⚠️ |
| | Backlog com plano de trabalho, domínio e contrato da API corrigidos | Larissa e Marcos | 14 | ⚠️ |
| | Acordo de equipe e metas definidas | Larissa e Marcos | 14 | ⚠️ |
| **Backend** | US01 – cadastro e login | Larissa | 15 | ⚠️ |
| | Categorias (seed) e US02 – fazer pedido (API) | Larissa | 15–16 | ⚠️ |
| | US03 e US04 – consulta, cancelamento e listagem com filtros (API) | Larissa | 16–17 | ⚠️ |
| | US05 – resposta ao pedido, status e histórico (API) | Larissa | 17 | ⚠️ |
| **Frontend** | Telas de cadastro/login (US01) | Marcos | 15 | ⚠️ |
| | Tela de fazer pedido (US02) e meus pedidos (US03) | Marcos | 15–16 | ⚠️ |
| | Painel da Associação com filtros e resposta aos pedidos (US04, US05) | Marcos | 16–17 | ⚠️ |
| **Testes** | Testes automatizados do backend e do frontend | Larissa e Marcos | 15–17 | ⚠️ |
| | Teste de usabilidade com moradores e membros da Associação ([metas](metas.md)) | Marcos (condução) | 17 | ⚠️ |
| | Correções a partir do teste | Larissa e Marcos | 17–18 | ⚠️ |
| **Entrega** | Sistema publicado (PaaS gratuita), README e manual simples | Larissa e Marcos | 18 | ⚠️ |
| | Devolutiva final à Associação com os números medidos | Larissa e Marcos | 20 | ⚠️ |

Reuniões de validação com a Associação: ao final das semanas 16 e 17 (demonstração do sistema, conforme o roteiro em [atas](atas/2026-08-18-tema.md)).

## Plano B

| Risco | Sinal de alerta | O que faremos |
| --- | --- | --- |
| **Baixa adesão** de moradores e membros no teste | Menos participantes confirmados do que o necessário até o início da semana 17 | Pedir à Associação que convide pessoalmente (grupo de mensagens, reunião da Associação); fazer o teste em um único encontro presencial na sede; se faltar gente, recrutar familiares/vizinhos como moradores e registrar a diferença nas metas |
| **Dados incompletos** (pedidos sem item, quantidade ou local) | Pedidos de teste sem item, quantidade ou local | Manter campos obrigatórios com validação clara; oferecer botão "usar minha localização" e lista de categorias pré-definida; se ainda faltar, simplificar o formulário, usar listas de itens e unidades prontas e acompanhar um morador no preenchimento |
| **Dificuldade de acompanhamento pela Associação** | Membros não conseguem localizar ou responder pedidos em até 1 minuto | Reforçar filtros por tipo, categoria e status, destacar pedidos `solicitado`; fazer uma sessão curta de treinamento presencial e entregar um guia de uma página; como alternativa, exportar a lista em planilha para a Associação |
| **Atraso no desenvolvimento** | Uma história não terminou na semana prevista | Priorizar US01–US05 como *Must* e cortar melhorias visuais; reduzir o escopo de filtros (apenas status e categoria); redistribuir horas entre a dupla |
| **Indisponibilidade da hospedagem gratuita** | Serviço fora do ar ou limite estourado | Ter o sistema rodando localmente com instruções no README para a demonstração |
