# Contrato da API - Mutirão

## Objetivo

Este documento define o contrato de comunicação entre o frontend e o backend do sistema Mutirão, especificando os recursos disponíveis, rotas, métodos HTTP, formatos de resposta, regras de acesso, paginação, filtros e formato dos erros.

## As 9 decisões do contrato

| | Decisão |
| --- | --- |
| Prefixo e versão | `/api` |
| Barra final nas rotas | NÃO |
| Convenção de nomes dos campos | `camelCase` |
| Formato de datas | ISO 8601 |
| Formato de valores monetários | string decimal |
| Paginação: estilo e tamanho padrão | uso de `count`, `next`, `previous` e `results` com 20 itens como tamanho padrão |
| Como se filtra, ordena e busca | parâmetros query string com `?q=`, `?ordering=` e `?{tipoEx}=` |
| Formato do erro de validação e do erro de permissão | objeto JSON erro, 400 para validação, 401 para autenticação, 403 para permissão |
| Relações | relacionamentos serão representados de forma aninhada; na escrita, serão informados por ID |

## Tabela de Recursos

| Recurso     | Método | Rota                              | O que faz                     | Sucesso   |
| ----------- | ------ | --------------------------------- | ----------------------------- | --------- |
| Ocorrência  | GET    | `/api/ocorrencias`                | Listagem                      | 200       |
|             | POST   | `/api/ocorrencias`                | Cria ocorrência               | 201       |
|             | GET    | `/api/ocorrencias/{id}`           | Consulta                      | 200       |
|             | PATCH  | `/api/ocorrencias/{id}`           | Atualiza parcialmente         | 200       |
|             | DELETE | `/api/ocorrencias/{id}`           | Remove                        | 204       |
| Categorias  | GET    | `/api/categorias`                 | Litagem                       | 200       |
|             | GET    | `/api/categorias/{id}`            | Consulta                      | 200       |
| Sessão      | POST   | `/api/auth/cadastro`              | Cria usuário                  | 201       |
|             | POST   | `/api/auth/login`                 | Autentica                     | 200       |
|             | POST   | `/api/auth/logout`                | Encerra sessão                | 204       |
|             | GET    | `/api/auth/eu`                    | Usuário atual                 | 200 / 401 |

## Exemplo de resposta JSON

### Listagem

```json
{
  "count": 42,
  "next": "https://mutirao.org/api/ocorrencias/?page=2",
  "previous": null,
  "results": [
    {
      "id": 10,
      "titulo": "Buraco na rua",
      "descricao": "Há um buraco próximo à praça.",
      "categoria": {
        "id": 1,
        "nome": "Infraestrutura"
      },
      "autor": {
        "id": 7,
        "nome": "Maria Silva"
      },
      "localizacao": {
        "latitude": -8.123456,
        "longitude": -34.987654
      },
      "dataCriacao": "2026-09-29T10:30:00Z",
      "status:" "emAnalise"
    }

    {
      "id": 11,
      "titulo": "Acúmulo de lixo",
      "descricao": "Há lixo acumulado próximo ao terreno.",
      "categoria": {
        "id": 2,
        "nome": "Limpeza e conservação"
      },
      "autor": {
        "id": 12,
        "nome": "João Santos"
      },
       "localizacao": {
        "latitude": -8.124321,
        "longitude": -34.986543
      },
      "dataCriacao": "2026-09-29T11:15:00Z",
      "status:" "emAnalise"
    }
  ]
}
```

### Detalhes

```json
{
  "id": 10,
  "titulo": "Buraco na rua",
  "descricao": "Há um buraco próximo à praça.",
  "categoria": {
    "id": 1,
    "nome": "Infraestrutura"
  },
  "autor": {
    "id": 7,
    "nome": "Maria Silva"
  },
  "localizacao": {
    "latitude": -8.123456,
    "longitude": -34.987654
  },
  "foto": "https://exemplo.com/uploads/ocorrencias/15.jpg",
  "dataCriacao": "2026-09-29T10:30:00Z",
  "status:" "emAnalise"
}
```
Se nao houver fotografia (opcional): 
```json 
"foto": null
```

## Exemplo de criação da ocorrência

```json
{
  "titulo": "Buraco na rua",
  "descricao": "Há um buraco próximo à praça.",
  "categoriaId": 1,
  "localizacao": {
    "latitude": -8.123456,
    "longitude": -34.987654
  }
}
```

Criação de ocorrência: utiliza multipart/form-data, permitindo o envio dos dados da ocorrência e, opcionalmente, uma imagem. A localização é obrigatória. O autor é identificado pela sessão do usuário autenticado.

## Exemplos de erro

### Erro de validação - 400 Bad Request

```json
{
  "titulo": ["Este campo é obrigatório."],
  "categoriaId": ["Este campo é obrigatório."]
}
```

### Usuário não autenticado — 401 Unauthorized

```json
{
  "detail": "Usuário não autenticado."
}
```

### Usuário sem permissão — 403 Forbidden

```json
{
  "detail": "Você não tem permissão para realizar esta operação."
}
```
```json
{
  "detail": "O prazo de 24 horas para exclusão desta ocorrência foi encerrado."
}
```