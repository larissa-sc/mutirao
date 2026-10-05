# Comprovação das metas

Complementa os critérios de sucesso do [MVP](MVP.md#3---critérios-de-sucesso). Contexto do canvas: cerca de **300 moradores** e **cerca de 10 membros** da Associação dos Moradores e Agricultores Familiares da Vila Nova de Cana Brava.

> ⚠️ Os números de participantes abaixo são uma **proposta**. Devem ser combinados com a Associação e confirmados na ata antes do teste. Ao fechar os números, ajustar os limites das metas usando a regra de cálculo abaixo.

## Participantes do teste

| Grupo | Quantidade prevista | Como serão escolhidos |
| --- | :---: | --- |
| Moradores/agricultores | 5 ⚠️ | Indicados pela Associação, com diferentes níveis de familiaridade com tecnologia |
| Membros da Associação | 3 ⚠️ | Quem recebe e responde os pedidos no dia a dia |

## Tarefas testadas

**Moradores/agricultores** (cada um faz as tarefas em seu próprio celular, sem ajuda da equipe, que apenas observa e cronometra):

| Tarefa | Descrição |
| --- | --- |
| T1 | Criar conta e fazer login |
| T2 | Fazer um pedido: **1 de material** (ex.: semente) e **1 de serviço de máquina** (ex.: patrol, com local) |
| T3 | Consultar os próprios pedidos e dizer o status de um deles |

Cada morador faz **2 pedidos** de teste (T2): 5 × 2 = **10 pedidos**.

**Membros da Associação**:

| Tarefa | Descrição |
| --- | --- |
| T4 | Localizar um pedido específico (indicado pela equipe) na lista |
| T5 | Filtrar por tipo e por status |
| T6 | Responder um pedido: aprovar (material) ou encaminhar (serviço) |

Cada membro localiza **4 pedidos** (T4): 3 × 4 = **12 buscas**.

## Como cada meta será calculada

Regra geral: `taxa = (casos que atendem ao critério ÷ total de casos) × 100`. Para atingir a meta, o número mínimo de casos que atendem é `⌈meta × total⌉`.

| Meta | Total de casos | Atende quando | Mínimo para atingir a meta |
| --- | :---: | --- | :---: |
| **90%** dos pedidos feitos em até 5 minutos | 10 pedidos (T2) | Cronômetro do início do formulário até o `201` ≤ 5 min | **9 de 10** |
| **100%** dos pedidos completos (material: item e quantidade · serviço: item e local) | todos os pedidos do período de validação (mín. 20) | Campos obrigatórios preenchidos, conferido no banco | **todos** |
| **≥ 20** pedidos no sistema durante a validação | contagem | Total de pedidos criados no período | **20** (ex.: os 10 do teste + 10 reais combinados com a Associação) |
| **100%** dos moradores conseguem consultar os próprios pedidos e o status | 5 moradores (T3) | Morador abre a lista e informa o status correto, sem ajuda | **5 de 5** |
| **90%** dos pedidos localizados em até 1 minuto | 12 buscas (T4) | Cronômetro do início da busca até localizar o pedido ≤ 1 min | **11 de 12** |
| **100%** dos pedidos respondidos pela Associação com status atualizado | pedidos do teste respondidos (T6) | Status mudou e o morador vê o novo status | **todos** |

## Como serão medidos e registrados

- **Cronometragem:** a equipe anota o tempo de cada tarefa em uma planilha (participante, tarefa, tempo, concluiu sem ajuda? sim/não, observações).
- **Campos obrigatórios e contagem de pedidos:** consulta ao banco no último dia da validação.
- **Evidências:** planilha de medição, prints/consulta do banco e ata do teste com assinatura da Associação, guardadas no repositório (`docs/`).
- **Resultado:** os números medidos são apresentados na devolutiva final e comparados com a meta.

## Registro dos resultados (preencher após o teste)

| Meta | Resultado medido | Atingiu? |
| --- | --- | :---: |
| 90% dos pedidos em até 5 min | | |
| 100% dos pedidos completos | | |
| ≥ 20 pedidos | | |
| 100% dos moradores consultam os próprios pedidos | | |
| 90% das buscas em até 1 min | | |
| 100% dos pedidos respondidos com status atualizado | | |
