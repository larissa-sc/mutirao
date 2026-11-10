# Mutirão

Sistema web para a Associação dos Moradores e Agricultores Familiares da Vila Nova de Cana Brava. Moradores e agricultores fazem pedidos de material (sementes, adubo, ferramentas) , de serviço de máquina (trator e patrol) e de declarações (morador, convivência), e a Associação os analisa, aprova ou encaminha à Prefeitura, registrando o andamento de cada um. 
Um projeto desenvolvido na disciplina DPW.

## Equipe:

Larissa Cavalcante
Marcos Gomes

## Como rodar

Requisitos: Node 24 (npm 11) e Docker.

```bash
docker compose up -d                  # PostgreSQL 16 (porta 5433)
cp backend/.env.example backend/.env  # DATABASE_URL já aponta para o Docker
npm install                           # na raiz do repositório
npm run migration:run -w backend      # cria as tabelas num banco vazio
npm run seed -w backend               # dados de exemplo
npm run dev:api                       # http://localhost:3000
```

Com a API no ar:

- **Swagger:** http://localhost:3000/api/docs (schema em `/api/openapi.json`)
- **Saúde:** http://localhost:3000/api/health

Testes (os e2e exigem o banco no ar e migrado):

```bash
npm run test -w backend
npm run test:e2e -w backend
```

Detalhes do modelo de dados e das migrações em [`backend/ENTIDADES.md`](backend/ENTIDADES.md).

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [Canvas](docs/canvas.md) | Problema, solução, escopo e riscos |
| [MVP](docs/MVP.md) | Escopo e critérios de sucesso |
| [Personas e cenários](docs/personas-e-cenarios.md) | Perfis de uso e cenário principal |
| [Backlog e plano de trabalho](docs/backlog.md) | Histórias, estimativas, responsáveis e critérios de aceite |
| [Domínio](docs/dominio.md) | Entidades, relações e regras |
| [Contrato da API](docs/contrato-api.md) | Rotas, permissões, status e formatos |
| [Acordo de equipe](docs/acordo-de-equipe.md) | Responsabilidades, revisão e Definition of Done |
| [Cronograma](docs/cronograma.md) | Entregas, prazos e plano B |
| [Metas](docs/metas.md) | Como as metas serão medidas |
| [Atas](docs/atas) | Registros das reuniões |
