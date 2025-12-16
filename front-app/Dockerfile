# Estágio 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Copia os arquivos de dependência
COPY package.json package-lock.json* ./

# Instala as dependências
RUN npm install

# Copia o código fonte do projeto
COPY . .

# Executa o build de produção
RUN npm run build

# Estágio 2: Servidor Web (Produção)
FROM nginx:alpine

# Copia a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os artefatos do build gerados pelo Angular para o diretório do Nginx
# Nota: No Angular 17+, o build padrão (application builder) gera em dist/<nome-do-app>/browser
COPY --from=build /app/dist/agro-dash-front/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
