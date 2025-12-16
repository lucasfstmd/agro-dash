# Terra Magna Project

Este projeto é uma aplicação fullstack containerizada, composta por:
- **Frontend:** Angular (Executado localmente)
- **Backend:** Node.js (Docker)
- **Banco de Dados:** PostgreSQL (Docker)

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (22 LTS recomendado) e npm

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

### 1. Backend e Banco de Dados (Docker)

Para subir apenas o backend e o banco de dados via Docker, execute o comando abaixo na raiz do projeto:

```bash
docker-compose up -d --build
```

### 2. Frontend

Para subir o front, basta rodar os seguintes comandos

```bash
cd front-app
```

```bash
npm install
```

```bash
npm run start
```

OBS: Foi otpado para rodar o front localmente por conta do mal funcionamento de uma lib usada no front.

## Acessando os Serviços

- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:3000 (ou a porta definida em `APP_PORT`)
- **Banco de Dados:** `localhost:5432` (acessível via ferramentas externas usando as credenciais do `.env`)

## Parando a Aplicação

```bash
docker-compose down
```
