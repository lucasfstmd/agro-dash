# Terra Magna Project

Este projeto é uma aplicação fullstack containerizada, composta por:
- **Frontend:** Angular (servido via Nginx)
- **Backend:** Node.js
- **Banco de Dados:** PostgreSQL

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuração

Antes de executar a aplicação, é necessário configurar as variáveis de ambiente.

1. Crie um arquivo `.env` na raiz do projeto.
2. Copie o conteúdo abaixo (ajustado para o ambiente Docker) ou baseie-se no `.env.example`:

```env
# Configurações do Banco de Dados
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=terra_magna
# Porta externa do banco (para acesso via DBeaver/PgAdmin)
POSTGRES_PORT=5432

# Configurações do Backend
APP_PORT=3000
MODE=development

# Configurações do Frontend
FRONT_PORT=80
```

> **Nota:** A variável `POSTGRES_HOST` é definida automaticamente como `postgres` dentro do `docker-compose.yml` para comunicação interna entre os containers.

## Executando a Aplicação

Para construir as imagens e iniciar os containers, execute o comando abaixo na raiz do projeto:

```bash
docker-compose up -d --build
```

## Acessando os Serviços

- **Frontend:** http://localhost:80 (ou a porta definida em `FRONT_PORT`)
- **Backend:** http://localhost:3000 (ou a porta definida em `APP_PORT`)
- **Banco de Dados:** `localhost:5432` (acessível via ferramentas externas usando as credenciais do `.env`)

## Parando a Aplicação

```bash
docker-compose down
```