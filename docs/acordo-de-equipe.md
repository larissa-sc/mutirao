# Acordo de equipe

**Projeto:** Mutirão · **Equipe:** Larissa Cavalcante e Marcos Gomes

## Responsabilidades

| Área | Responsável principal | Apoio |
| --- | --- | --- |
| Backend (NestJS, banco, validação do login Firebase) | Marcos | Larissa |
| Frontend (React, telas, login Firebase, usabilidade) | Larissa | Marcos |
| Documentação (ata, backlog, contrato, domínio) | Larissa e Marcos (dividido por documento) | |
| Contato e reuniões com a Associação | Larissa e Marcos, ambos presentes | |
| Testes com moradores e Associação | Marcos (condução) | Larissa (anotações) |
| Registro das atas | Larissa | Marcos |
| Entrega final e devolutiva | Larissa e Marcos | |

A divisão por história de usuário está em [backlog.md](backlog.md#plano-de-trabalho). Responsável principal é quem entrega; apoio é quem revisa e ajuda a destravar.

## Rotina de trabalho

- **Reunião de alinhamento:** 1 vez por semana, 30 min (a definir dia e horário), por chat ou chamada. Pauta fixa: o que foi feito, o que vai ser feito, o que está bloqueando.
- **Capacidade:** 10 h/semana no total entre os dois. Se alguém não puder cumprir sua parte, avisa na reunião ou antes, para redistribuir.
- **Comunicação:** chat da dupla para o dia a dia; decisões importantes ficam registradas na ata ou neste repositório.

## Rotina de revisão

1. Todo trabalho acontece em uma **branch** própria (`feat/...`, `docs/...`, `fix/...`); ninguém faz commit direto na `main`.
2. Ao terminar, abre-se um **Pull Request** descrevendo o que mudou e qual história (US) atende.
3. **Quem não escreveu o código revisa.** O PR só entra na `main` com aprovação da outra pessoa.
4. Prazo de revisão: até **2 dias úteis** após a abertura do PR.
5. O autor resolve os comentários; o revisor confirma e faz o merge (ou o autor, após a aprovação).
6. PRs pequenos e focados em uma história.

## Definition of Done

Uma história só é considerada **pronta** quando:

- [ ] Todos os critérios de aceite da história passam (ver [backlog.md](backlog.md#critérios-de-aceite)).
- [ ] Segue o [contrato da API](contrato-api.md) (rotas, formatos, status HTTP e permissões).
- [ ] Tem testes (unitário ou e2e) cobrindo o caminho principal e os erros esperados, e todos passam.
- [ ] O lint e a compilação passam sem erros.
- [ ] O PR foi revisado e aprovado pela outra pessoa e já está na `main`.
- [ ] Funciona rodando localmente a partir do README.
- [ ] Documentação afetada (contrato, domínio, README) foi atualizada.
- [ ] Foi demonstrada à outra pessoa (e, quando aplicável, à Associação).

## Como as decisões serão tomadas

- **Decisões comuns** (escolha de ferramenta, divisão de tarefa, detalhe de tela): por consenso entre Larissa e Marcos, na reunião semanal ou por chat.
- **Empate / impasse:** testa-se a opção mais simples que cumpra o critério de aceite; se ainda houver dúvida, vale o que melhor atende à **Associação** (a necessidade do parceiro desempata) ou, se for questão acadêmica, o que o professor orientar.
- **Escopo:** nenhuma funcionalidade nova entra sem estar no [MVP](MVP.md). Mudança de escopo exige acordo dos dois e registro na ata.
- **Registro:** toda decisão relevante é anotada na ata da reunião (campo "Decisões") com justificativa e quem decidiu.
- **Prazo em risco:** quem percebe avisa imediatamente; aciona-se o plano B do [cronograma](cronograma.md#plano-b).
